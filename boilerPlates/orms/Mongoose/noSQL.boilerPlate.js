const mongoDBAppModuleBoilerPlate = `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
   imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory : (configService : ConfigService) => ({
        uri : configService.get('MONGO_URI'),
        maxPoolSize : 10,
        autoCreate : true
      }),
      inject : [ConfigService]
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;