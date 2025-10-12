import { Logger } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: true,
      methods: ['GET'],
      allowedHeaders: ['Content-Type', 'Accept', 'Origin'],
      credentials: false,
    });
    const configService = app.get(ConfigService);

    const port = configService.get<number>('PORT', 3000);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';
    const url = `http://localhost:${port}`;

    if (!isProduction) setupSwagger(app);
    await app.listen(port);

    logger.log(`🚀 Application is running on: ${url}`);
    if (!isProduction) {
      logger.log(`📘 Swagger API Docs: ${url}/api/`);
    }
  } catch (error: unknown) {
    logger.error(`❌ Error during bootstrap: ${JSON.stringify(error)}`);

    process.exit(1);
  }
}

function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Repositories Service API Example')
    .setDescription('API documentation for the Repositories Service')
    .setVersion('1.0')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

bootstrap();
