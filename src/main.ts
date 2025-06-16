import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: ['http://localhost:3000'], credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(cookieParser());

  const swagger = new DocumentBuilder()
    .setTitle('My Project (NestJs-Api)')
    .setDescription('My Project Backend Api (Powered by NestJs)')
    .addServer('http://localhost:8000')
    .setTermsOfService('http://localhost:8000/terms-of-service')
    .setLicense('MIT', 'http://localhost:8000/license')
    .setVersion('1.0')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('swagger', app, documentation);

  await app.listen(process.env.PORT ?? 8000);
}
void bootstrap();
