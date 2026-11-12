import { Module } from '@nestjs/common';
import { PayloadsService } from './payloads.service';
import { PayloadsController } from './payloads.controller';

@Module({
  controllers: [PayloadsController],
  providers: [PayloadsService],
})
export class PayloadsModule {}
