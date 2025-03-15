export const globalCatchMainBoilerPlate = `import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module';
import { GlobalCatchHandler } from './common/filters/global-catch.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalCatchHandler());
  app.enableCors();
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
`;