import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global middleware
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || '/api');

  // Health check endpoint
  app.get('/health', () => ({ status: 'ok', timestamp: new Date() }));

  const port = process.env.PORT || 3001;
  const host = process.env.SERVER_HOST || '0.0.0.0';

  await app.listen(port, host);
  logger.log(`🚀 Application is running on: http://${host}:${port}`);
  logger.log(`📡 API available at: http://${host}:${port}${process.env.API_PREFIX || '/api'}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
