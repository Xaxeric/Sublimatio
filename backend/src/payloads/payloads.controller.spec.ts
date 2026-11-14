import { Test, TestingModule } from '@nestjs/testing';
import { PayloadsController } from './payloads.controller';
import { PayloadsService } from './payloads.service';

describe('PayloadsController', () => {
  let controller: PayloadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayloadsController],
      providers: [PayloadsService],
    }).compile();

    controller = module.get<PayloadsController>(PayloadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
