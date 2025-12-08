import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT') || 4000;
  
  await app.listen(port, '0.0.0.0');
  
  console.log(`\n🥊 Club Ring Backend is running on: http://localhost:${port}`);
  console.log(`📡 WebSocket server is ready on: ws://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health\n`);
}

bootstrap();
