import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('exposes $connect and $disconnect lifecycle methods via PrismaClient', async () => {
    const service = new PrismaService();
    expect(typeof service.onModuleInit).toBe('function');
    expect(typeof service.onModuleDestroy).toBe('function');
    // PrismaClient provides these; verify our hooks delegate to them.
    const connect = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);
    const disconnect = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(connect).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
