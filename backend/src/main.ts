import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt.guard';

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
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // API prefix
  app.setGlobalPrefix('api');

  const port = configService.get<number>('port') || 4000;
  const nodeEnv = configService.get<string>('nodeEnv') || 'development';

  await app.listen(port, '0.0.0.0');

  console.log('\n🎉 Club Ring Backend Started!');
  console.log(`📍 Environment: ${nodeEnv}`);
  console.log(`🔌 Listening on: http://0.0.0.0:${port}`);
  console.log(`📡 WebSocket: ws://0.0.0.0:${port}`);
  console.log(`🏥 Health: http://0.0.0.0:${port}/api/health\n`);
}

bootstrap().catch((err) => {
  console.error('\n❌ Failed to start application:', err);
  process.exit(1);
});
