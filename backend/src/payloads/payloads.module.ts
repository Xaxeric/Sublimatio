import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PayloadsService } from './payloads.service';
import { PayloadsController } from './payloads.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PayloadsController],
  providers: [PayloadsService],
})
export class PayloadsModule {}
