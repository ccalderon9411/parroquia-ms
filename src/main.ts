import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import * as classTransformer from 'class-transformer';
import * as classValidator from 'class-validator';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const {
    server,
    swagger,
    project,
    server: { cors },
  } = config();
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });

  app.setGlobalPrefix(`${server.context}`);
  app.use([cookieParser(), compression(), helmet()]);

  app.useGlobalPipes(
    new ValidationPipe({
      validatorPackage: classValidator,
      transformerPackage: classTransformer,
      whitelist: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (swagger.enabled) {
    const config = new DocumentBuilder()
      .setTitle(`${project.name}`)
      .setVersion(`${project.version}`)
      .setDescription(`Swagger - ${project.description}`)
      .setExternalDoc('Documentation', project.homepage)
      .setContact(project.author.name, project.author.url, project.author.email)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token',
        },
        'access-token',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Refresh token',
        },
        'refresh-token',
      )
      .addServer(`/${server.context}`)
      .build();
    const document: OpenAPIObject = SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: true,
      autoTagControllers: true,
    });
    SwaggerModule.setup(`${server.context}/${swagger.path}`, app, document, {});
  }

  if (cors.enabled) {
    app.enableCors({
      origin: cors.origins,
      allowedHeaders: cors.allowedHeaders,
      methods: cors.allowedMethods,
      credentials: cors.credentials,
    });
  }

  await app.listen(server.port);

  const appServer = `http://localhost:${server.port}/${server.context}`;

  if (swagger.enabled) {
    Logger.log(
      `📚 Swagger is running on: ${appServer}/${swagger.path}`,
      `${project.name}`,
    );
  }

  Logger.log(`🚀 Application is running on: ${appServer}`, `${project.name}`);
}

void bootstrap().catch((error: unknown) => {
  if (error instanceof Error) {
    Logger.error(error.message, error.stack, 'Bootstrap');
  } else {
    Logger.error(String(error), undefined, 'Bootstrap');
  }

  process.exit(1);
});
