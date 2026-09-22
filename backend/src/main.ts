import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable Global Validation Pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 2. Enable CORS for frontend communication (Vite / React client)
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  // 3. Configure Swagger Documentation & Playground
  const config = new DocumentBuilder()
    .setTitle('Institutional ERP Platform API')
    .setDescription(
      'Live API Playground for testing ABAC Context Guards, OCC Versioning, Maker-Checker Workflows, and Audit Ledger.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your signed JWT token',
        in: 'header',
      },
      'JWT-auth', // Reference name used in security decorators
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 4. Start server on PORT from .env or default to 3001
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 ERP Backend is running on: http://localhost:${port}`);
  console.log(`📖 Swagger API Docs are live on: http://localhost:${port}/docs`);
}
bootstrap();