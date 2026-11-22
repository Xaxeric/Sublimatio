import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PayloadsService } from './payloads.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Payload } from './entities/payload.entity';

/**
 * Unit tests mock PrismaClient at the delegate level, so no live database is
 * required. Persistence itself is proven end-to-end in the README (restart test).
 */
describe('PayloadsService', () => {
  let service: PayloadsService;
  let store: Payload[];
  let prisma: {
    payload: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  const seed: Payload = {
    id: 'sub-seed-01',
    name: 'Seed Payload',
    type: 'text',
    content: 'initial content',
    device: 'Workstation (Local Host)',
    totalTTL: 60,
    remainingTTL: 60,
    size: '0.0 KB',
    mime: 'text/plain',
    hash: 'sha256:seed',
    isPinned: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    store = [{ ...seed }];

    prisma = {
      payload: {
        findFirst: jest.fn(async ({ where }: any) => {
          const nameFilter = where?.name;
          if (!nameFilter) return null;
          const needle =
            typeof nameFilter === 'string'
              ? nameFilter
              : (nameFilter.equals ?? '');
          const match = store.find((p) => {
            const nameOk =
              p.name.toLowerCase() === String(needle).toLowerCase();
            const selfOk = !where.id || p.id !== where.id.not;
            return nameOk && selfOk;
          });
          return match ?? null;
        }),
        findUnique: jest.fn(async ({ where }: any) => {
          return store.find((p) => p.id === where.id) ?? null;
        }),
        findMany: jest.fn(async () => [...store]),
        create: jest.fn(async ({ data }: any) => {
          store.unshift({ ...data });
          return { ...data };
        }),
        update: jest.fn(async ({ where, data }: any) => {
          const index = store.findIndex((p) => p.id === where.id);
          store[index] = { ...store[index], ...data };
          return { ...store[index] };
        }),
        delete: jest.fn(async ({ where }: any) => {
          const index = store.findIndex((p) => p.id === where.id);
          const [deleted] = store.splice(index, 1);
          return { ...deleted };
        }),
        count: jest.fn(async (args?: any) => {
          const type = args?.where?.type;
          return type
            ? store.filter((p) => p.type === type).length
            : store.length;
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayloadsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PayloadsService>(PayloadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- CREATE -------------------------------------------------------------
  it('create() persists a payload and returns the expected shape', async () => {
    const result = await service.create({
      name: 'Week10 Persistence Proof',
      type: 'text',
      content: 'Survives restart',
      totalTTL: 120,
    } as any);

    expect(prisma.payload.create).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      name: 'Week10 Persistence Proof',
      type: 'text',
      content: 'Survives restart',
      device: 'Workstation (Local Host)',
      totalTTL: 120,
      remainingTTL: 120,
      mime: 'text/plain',
      isPinned: false,
    });
    expect(result.id).toMatch(/^sub-/);
    expect(result.hash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(new Date(result.createdAt).toISOString()).toBe(result.createdAt);
    expect(store[0].name).toBe('Week10 Persistence Proof');
  });

  it('create() throws ConflictException on a case-insensitive duplicate name', async () => {
    await expect(
      service.create({
        name: 'seed payload',
        type: 'text',
        content: 'x',
        totalTTL: 60,
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.payload.create).not.toHaveBeenCalled();
  });

  it('create() throws BadRequestException when link has no URL', async () => {
    await expect(
      service.create({
        name: 'Bad Link',
        type: 'link',
        totalTTL: 60,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create() throws BadRequestException when text has no content', async () => {
    await expect(
      service.create({
        name: 'Bad Text',
        type: 'text',
        totalTTL: 60,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create() derives size and mime defaults deterministically', async () => {
    const result = await service.create({
      name: 'Default Derivation',
      type: 'link',
      url: 'https://example.com',
      totalTTL: 30,
    } as any);
    expect(result.mime).toBe('text/uri-list');
    expect(result.size).toBe('1.0 KB');
  });

  // --- READ ---------------------------------------------------------------
  it('findAll() returns every stored payload', async () => {
    const result = await service.findAll();
    expect(prisma.payload.findMany).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(seed);
  });

  it('findOne() returns the matching payload', async () => {
    await expect(service.findOne('sub-seed-01')).resolves.toEqual(seed);
  });

  it('findOne() throws NotFoundException for a missing id', async () => {
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // --- UPDATE -------------------------------------------------------------
  it('update() changes fields and keeps id stable', async () => {
    const result = await service.update('sub-seed-01', {
      remainingTTL: 10,
      isPinned: true,
    } as any);
    expect(result).toMatchObject({
      id: 'sub-seed-01',
      remainingTTL: 10,
      isPinned: true,
    });
  });

  it('update() throws NotFoundException for a missing id', async () => {
    await expect(
      service.update('missing', { remainingTTL: 1 } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update() throws ConflictException on duplicate name excluding self', async () => {
    store.push({ ...seed, id: 'sub-other', name: 'Another' });
    await expect(
      service.update('sub-seed-01', { name: 'ANOTHER' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('update() allows keeping its own name', async () => {
    await expect(
      service.update('sub-seed-01', { name: 'SEED PAYLOAD' } as any),
    ).resolves.toMatchObject({ id: 'sub-seed-01', name: 'SEED PAYLOAD' });
  });

  // --- DELETE -------------------------------------------------------------
  it('remove() deletes the payload and returns message + deleted', async () => {
    const result = await service.remove('sub-seed-01');
    expect(prisma.payload.delete).toHaveBeenCalled();
    expect(result.deleted).toEqual(seed);
    expect(result.message).toContain('Seed Payload');
    expect(store).toHaveLength(0);
  });

  it('remove() throws NotFoundException for a missing id', async () => {
    await expect(service.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // --- BONUS QUERIES -------------------------------------------------------
  it('countByType() returns total and filtered counts', async () => {
    store.push({ ...seed, id: 'sub-2', name: 'Second', type: 'file' } as any);
    await expect(service.countByType()).resolves.toEqual({ count: 2 });
    await expect(service.countByType('file')).resolves.toEqual({ count: 1 });
  });
});
