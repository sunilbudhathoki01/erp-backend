import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import setupSwagger from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not defined in the DTO
      forbidNonWhitelisted: true, // throws error if extra properties are sent
      transform: true, // auto-converts payloads into DTO class instances
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
