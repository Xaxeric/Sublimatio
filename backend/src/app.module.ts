import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PayloadsModule } from './payloads/payloads.module';

@Module({
  imports: [
    // Base rate-limit config; login overrides it explicitly via @Throttle().
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60000, limit: 5 }],
    }),
    AuthModule,
    PayloadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
