import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const extraOrigins = (config.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://financial-control-silk.vercel.app',
    'https://financial-control-git-feat-capacitor-pedromissaglias-projects.vercel.app',
    ...extraOrigins,
  ]);
  const port = Number(config.get('PORT') ?? 3001);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || allowedOrigins.has(requestOrigin)) {
        callback(null, true);
        return;
      }

      try {
        const { protocol, hostname } = new URL(requestOrigin);
        const isVercelFrontend =
          protocol === 'https:' &&
          hostname.endsWith('.vercel.app') &&
          hostname.includes('financial-control');
        callback(null, isVercelFrontend);
      } catch {
        callback(null, false);
      }
    },
    credentials: true,
  });
  app.useBodyParser('json', { limit: '10mb' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
