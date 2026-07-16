import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('ERP Backend API')
    .setDescription('RoutesResolver')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
