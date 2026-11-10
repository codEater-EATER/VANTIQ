import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for web and mobile
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'exp://localhost:8081',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('VANTIQ API')
    .setDescription('VANTIQ - Intelligence That Converts. AI · Leads · Business Intelligence')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);

  console.log(`🚀 VANTIQ Backend running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
