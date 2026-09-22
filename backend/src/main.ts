import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable CORS for frontend communication
  app.enableCors();

  // 2. Configure Swagger Documentation & Playground
  const config = new DocumentBuilder()
    .setTitle('Institutional ERP Platform API')
    .setDescription(
      'Live API Playground for testing ABAC Context Guards, OCC Versioning, and Maker-Checker Workflows.',
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

  // 3. Start server on PORT from .env or default to 3001
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 ERP Backend is running on: http://localhost:${port}`);
  console.log(`📖 Swagger API Docs are live on: http://localhost:${port}/docs`);
}
bootstrap();