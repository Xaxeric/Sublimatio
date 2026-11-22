import { Test, TestingModule } from '@nestjs/testing';
import { PayloadsController } from './payloads.controller';
import { PayloadsService } from './payloads.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayloadsController', () => {
  let controller: PayloadsController;

  const prismaMock = {
    payload: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayloadsController],
      providers: [
        PayloadsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    controller = module.get<PayloadsController>(PayloadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
