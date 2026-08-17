import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const origin = config.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000';
  const port = Number(config.get('PORT') ?? 3001);

  app.enableCors({ origin, credentials: true });
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
