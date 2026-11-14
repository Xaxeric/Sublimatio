import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePayloadDto } from './dto/create-payload.dto';
import { UpdatePayloadDto } from './dto/update-payload.dto';
import { Payload } from './entities/payload.entity';

@Injectable()
export class PayloadsService {
  // In-memory array storage representing volatile RAM mesh buffer
  private payloads: Payload[] = [
    {
      id: 'sub-f-01',
      type: 'file',
      name: 'session-auth-token.pem',
      size: '184 KB',
      mime: 'application/x-pem-file',
      content:
        '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0w9mX8q2p...\n[EPHEMERAL RAM BUFFER - ZERO KNOWLEDGE]\n-----END RSA PRIVATE KEY-----',
      device: 'Mobile (Pixel 8)',
      totalTTL: 45,
      remainingTTL: 35,
      createdAt: new Date(Date.now() - 10000).toISOString(),
      hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      isPinned: false,
    },
    {
      id: 'sub-t-01',
      type: 'text',
      name: 'Staging Database Connection URL',
      content:
        'DATABASE_URL=postgres://sync_daemon:q9#N_v98Z01@10.24.8.19:5432/sublimatio_ephemeral?sslmode=verify-full',
      device: 'Desktop (Workstation)',
      totalTTL: 240,
      remainingTTL: 140,
      createdAt: new Date(Date.now() - 60000).toISOString(),
      hash: 'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      isPinned: false,
    },
    {
      id: 'sub-f-03',
      type: 'file',
      name: 'crash-dump-telemetry.gz',
      size: '5.1 MB',
      mime: 'application/gzip',
      content: '[GZIP Archive Binary: 5.1 MB Ephemeral Telemetry Dump]',
      device: 'Node #4 (Gateway)',
      totalTTL: 900,
      remainingTTL: 680,
      createdAt: new Date(Date.now() - 180000).toISOString(),
      hash: 'sha256:1a8565a9da720485d2381a37498be9c7d826529c72179d461fd307a615e10eef',
      isPinned: false,
    },
    {
      id: 'sub-l-02',
      type: 'link',
      name: 'Sublimatio Project Repository',
      url: 'https://github.com/Xaxeric/Sublimatio',
      device: 'Mobile (Asus Zenfone)',
      totalTTL: 1200,
      remainingTTL: 980,
      createdAt: new Date(Date.now() - 300000).toISOString(),
      hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      isPinned: true,
    },
    {
      id: 'sub-t-02',
      type: 'text',
      name: 'Zero-Knowledge Session Handshake',
      content:
        'CLIENT_NONCE=4e8a1c90f23b7;EPOCH_EXPIRY=1729230500;SIGNATURE=v1.ecdsa.8f92ab',
      device: 'Mobile (Pixel 8)',
      totalTTL: 60,
      remainingTTL: 20,
      createdAt: new Date(Date.now() - 40000).toISOString(),
      hash: 'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      isPinned: false,
    },
  ];

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
   * Create a new payload in the volatile buffer
   */
  create(createPayloadDto: CreatePayloadDto): Payload {
    // 1. Skenario Error ConflictException: Mencegah nama payload duplikat
    const duplicate = this.payloads.find(
      (p) => p.name.trim().toLowerCase() === createPayloadDto.name.trim().toLowerCase(),
    );
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

    const newPayload: Payload = {
      id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: createPayloadDto.name.trim(),
      type: createPayloadDto.type,
      content: createPayloadDto.content,
      url: createPayloadDto.url,
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

    this.payloads.unshift(newPayload);
    return newPayload;
  }

  /**
   * Return all active payloads in the memory buffer
   */
  findAll(): Payload[] {
    return this.payloads;
  }

  /**
   * Find a specific payload by ID
   */
  findOne(id: string): Payload {
    const payload = this.payloads.find((p) => p.id === id);
    if (!payload) {
      // 2. Skenario Error NotFoundException: Data tidak ditemukan
      throw new NotFoundException(
        `Payload dengan ID "${id}" tidak ditemukan di buffer RAM!`,
      );
    }
    return payload;
  }

  /**
   * Update an existing payload
   */
  update(id: string, updatePayloadDto: UpdatePayloadDto): Payload {
    const index = this.payloads.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(
        `Gagal memperbarui: Payload dengan ID "${id}" tidak ditemukan!`,
      );
    }

    // Jika memperbarui nama, cek apakah nama baru berkonflik dengan payload lain
    if (updatePayloadDto.name) {
      const newName = updatePayloadDto.name.trim().toLowerCase();
      const duplicate = this.payloads.find(
        (p) =>
          p.id !== id &&
          p.name.trim().toLowerCase() === newName,
      );
      if (duplicate) {
        throw new ConflictException(
          `Payload dengan nama "${updatePayloadDto.name}" sudah digunakan oleh payload lain!`,
        );
      }
    }

    const existing = this.payloads[index];
    const updated: Payload = {
      ...existing,
      ...updatePayloadDto,
      // Pastikan id dan hash asli tetap konsisten kecuali diubah secara eksplisit
      id: existing.id,
    };

    this.payloads[index] = updated;
    return updated;
  }

  /**
   * Remove a payload from the buffer (manual sublimation / delete)
   */
  remove(id: string): { message: string; deleted: Payload } {
    const index = this.payloads.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(
        `Gagal menghapus: Payload dengan ID "${id}" tidak ditemukan!`,
      );
    }

    const [deleted] = this.payloads.splice(index, 1);
    return {
      message: `Payload "${deleted.name}" berhasil disublimasikan (dihapus dari RAM).`,
      deleted,
    };
  }
}
