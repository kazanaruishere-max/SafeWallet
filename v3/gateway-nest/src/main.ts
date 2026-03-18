import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security: Enable CORS
  app.enableCors();
  
  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('SafeWallet V3 API Gateway')
    .setDescription('The API Gateway for SafeWallet V3 Microservices')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`[*] API Gateway running on: http://localhost:3000`);
}
bootstrap();
