import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // WebSocket
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // Глобальные пайпы
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(`🎮 Club Ring Game Server запущен на порту ${port}`);
  });
}

bootstrap();
