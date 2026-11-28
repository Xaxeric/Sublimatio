import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // Load backend/.env (DATABASE_URL, JWT_SECRET) without committing secrets.
  process.loadEnvFile?.();

  const app = await NestFactory.create(AppModule);

  // Helmet sets X-Content-Type-Options, X-Frame-Options, etc. on all responses.
  app.use(helmet());

  // Aktifkan CORS agar frontend Vite (http://localhost:5173) dapat mengakses API
  app.enableCors();

  // Aktifkan ValidationPipe secara global sesuai instruksi poin 5
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`[Sublimatio Backend] Server NestJS berjalan di http://localhost:${port}`);
}
void bootstrap();
