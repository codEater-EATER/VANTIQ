import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  console.log(`🚀 VANTIQ Backend running on http://localhost:${port}`);
}

bootstrap();
