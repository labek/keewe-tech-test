import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule);

const config = new DocumentBuilder().setTitle('Keewe API').setVersion('1.0').setOpenAPIVersion('3.1.0').build();

const documentFactory = () => SwaggerModule.createDocument(app, config);

SwaggerModule.setup('api', app, documentFactory);

console.log(`Swagger API documentation available at http://localhost:${process.env.PORT ?? 3000}/api`);

app.enableShutdownHooks();
await app.listen(process.env.PORT ?? 3000);
