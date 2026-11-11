import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
