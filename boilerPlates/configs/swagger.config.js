export const swaggerConfig = `import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
    .setTitle('API Title')
    .setDescription('Api Description')
    .setVersion('1.0')
    .addTag('APIS')
    .addBearerAuth()
    .addServer('http://localhost:4000')
    .build();`


export const swaggerConfigExtra = `import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './swagger.config';

const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup('api', app, document);`