import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PayloadsModule } from './payloads/payloads.module';

@Module({
  imports: [PayloadsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
