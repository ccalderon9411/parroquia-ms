import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const { server, swagger, project, server: { cors } } = config();
  const app = await NestFactory.create(AppModule, {
    logger: new Logger()
  });

  app.setGlobalPrefix(`${server.context}`);
  app.use([cookieParser(), compression(), helmet()]);

  
  app.useGlobalPipes(
    new ValidationPipe({
      validatorPackage: require('class-validator'),
      transformerPackage: require('class-transformer'),
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
      allowedHeaders: `${cors.allowedHeaders}`,
      methods: `${cors.allowedMethods}`,
      credentials: cors.credentials,
    });
  }
  
  await app.listen(server.port, async (): Promise<void> => {
    const appServer: string = `http://localhost:${server.port}/${server.context}`;
    if (swagger.enabled) {
      Logger.log(`📚 Swagger is running on: ${appServer}/${swagger.path}`, `${project.name}`);
    }
    Logger.log(`🚀 Application is running on: ${appServer}`, `${project.name}`);
  });
}
bootstrap();
