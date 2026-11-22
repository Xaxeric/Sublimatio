import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaService } from '../prisma/prisma.service';
import { CreatePayloadDto } from './dto/create-payload.dto';
import { UpdatePayloadDto } from './dto/update-payload.dto';
import { Payload } from './entities/payload.entity';

/**
 * Maps a Prisma row to the app's Payload entity. Optional DB columns come back
 * as `null`; the API keeps the original shape where those fields are absent.
 */
function toEntity(row: Prisma.PayloadGetPayload<object>): Payload {
  const payload: Payload = {
    id: row.id,
    name: row.name,
    type: row.type,
    device: row.device,
    totalTTL: row.totalTTL,
    remainingTTL: row.remainingTTL,
    hash: row.hash,
    isPinned: row.isPinned,
    createdAt: row.createdAt,
  };
  if (row.content != null) payload.content = row.content;
  if (row.url != null) payload.url = row.url;
  if (row.size != null) payload.size = row.size;
  if (row.mime != null) payload.mime = row.mime;
  return payload;
}

@Injectable()
export class PayloadsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Generate mock SHA-256 hash
   */
  private generateHash(): string {
    const chars = '0123456789abcdef';
    let hex = '';
    for (let i = 0; i < 64; i++) {
      hex += chars[Math.floor(Math.random() * chars.length)];
    }
    return `sha256:${hex}`;
  }

  /**
   * Create a new payload in the persistent store
   */
  async create(createPayloadDto: CreatePayloadDto): Promise<Payload> {
    // 1. Skenario Error ConflictException: Mencegah nama payload duplikat
    const duplicate = await this.prisma.payload.findFirst({
      where: {
        name: { equals: createPayloadDto.name.trim(), mode: 'insensitive' },
      },
    });
    if (duplicate) {
      throw new ConflictException(
        `Payload dengan nama "${createPayloadDto.name}" sudah ada di memori buffer!`,
      );
    }

    // Validasi konten spesifik tipe data
    if (createPayloadDto.type === 'link' && !createPayloadDto.url?.trim()) {
      throw new BadRequestException('Payload tipe "link" memerlukan field URL yang valid!');
    }
    if (createPayloadDto.type === 'text' && !createPayloadDto.content?.trim()) {
      throw new BadRequestException('Payload tipe "text" memerlukan field content yang valid!');
    }

    const data: Prisma.PayloadCreateInput = {
      id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: createPayloadDto.name.trim(),
      type: createPayloadDto.type,
      content: createPayloadDto.content ?? null,
      url: createPayloadDto.url ?? null,
      device: createPayloadDto.device?.trim() || 'Workstation (Local Host)',
      totalTTL: createPayloadDto.totalTTL,
      remainingTTL: createPayloadDto.remainingTTL ?? createPayloadDto.totalTTL,
      size:
        createPayloadDto.size ||
        (createPayloadDto.content
          ? `${(createPayloadDto.content.length / 1024).toFixed(1)} KB`
          : '1.0 KB'),
      mime:
        createPayloadDto.mime ||
        (createPayloadDto.type === 'link'
          ? 'text/uri-list'
          : createPayloadDto.type === 'text'
            ? 'text/plain'
            : 'application/octet-stream'),
      hash: createPayloadDto.hash || this.generateHash(),
      isPinned: createPayloadDto.isPinned ?? false,
      createdAt: new Date().toISOString(),
    };

    const created = await this.prisma.payload.create({ data });
    return toEntity(created);
  }

  /**
   * Return all payloads from the persistent store
   */
  async findAll(): Promise<Payload[]> {
    const rows = await this.prisma.payload.findMany();
    return rows.map(toEntity);
  }

  /**
   * Find a specific payload by ID
   */
  async findOne(id: string): Promise<Payload> {
    const payload = await this.prisma.payload.findUnique({ where: { id } });
    if (!payload) {
      // 2. Skenario Error NotFoundException: Data tidak ditemukan
      throw new NotFoundException(
        `Payload dengan ID "${id}" tidak ditemukan di buffer RAM!`,
      );
    }
    return toEntity(payload);
  }

  /**
   * Update an existing payload
   */
  async update(id: string, updatePayloadDto: UpdatePayloadDto): Promise<Payload> {
    const existing = await this.prisma.payload.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(
        `Gagal memperbarui: Payload dengan ID "${id}" tidak ditemukan!`,
      );
    }

    // Jika memperbarui nama, cek apakah nama baru berkonflik dengan payload lain
    if (updatePayloadDto.name) {
      const newName = updatePayloadDto.name.trim().toLowerCase();
      const duplicate = await this.prisma.payload.findFirst({
        where: {
          id: { not: id },
          name: { equals: newName, mode: 'insensitive' },
        },
      });
      if (duplicate) {
        throw new ConflictException(
          `Payload dengan nama "${updatePayloadDto.name}" sudah digunakan oleh payload lain!`,
        );
      }
    }

    // Pastikan id tetap konsisten; field lain yang tidak dikirim tetap dari data lama
    const data: Prisma.PayloadUpdateInput = {
      ...updatePayloadDto,
      name: updatePayloadDto.name?.trim() ?? existing.name,
      id: existing.id,
    };
    const updated = await this.prisma.payload.update({ where: { id }, data });
    return toEntity(updated);
  }

  /**
   * Remove a payload from the store (manual sublimation / delete)
   */
  async remove(id: string): Promise<{ message: string; deleted: Payload }> {
    const found = await this.prisma.payload.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException(
        `Gagal menghapus: Payload dengan ID "${id}" tidak ditemukan!`,
      );
    }

    const deleted = toEntity(
      await this.prisma.payload.delete({ where: { id } }),
    );
    return {
      message: `Payload "${deleted.name}" berhasil disublimasikan (dihapus dari RAM).`,
      deleted,
    };
  }

  /**
   * Bonus: advanced query — count payloads, optionally filtered by type.
   */
  async countByType(type?: Payload['type']): Promise<{ count: number }> {
    const count = type
      ? await this.prisma.payload.count({ where: { type } })
      : await this.prisma.payload.count();
    return { count };
  }
}
