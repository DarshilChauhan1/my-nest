#!/usr/bin/env node
import { program } from "commander";
import { execSync } from "child_process";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";


const swaggerBoilerplate = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.enableCors();
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('API Title')
    .setDescription('Api Description')
    .setVersion('1.0')
    .addTag('APIS')
    .addBearerAuth()
    .addServer('http://localhost:4000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
`;

const postgreSQLBoilerplate = `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        poolSize: 100,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;

const mongoDBBoilerPlate = `import { Module } from '@nestjs/common';
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

const mySQLBoilerPlate = `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        poolSize: 100,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;

const jwtBoilerPlate = `import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = request.headers['authorization'];
        if (!token) throw new UnauthorizedException('Unauthorized Access');

        // verify the tokens
        const verify =  await this.verifyToken(token);
        // decode the token and save in request object
        if(verify) {
            const user = await this.jwtService.decode(token.split(' ')[1]);
            request.user = user;
            return true;
        }
        return false;
    }

    async verifyToken(token: string) {
        // check for bearer mark
        const checkBearer = token.split(' ')[0];
        if (checkBearer !== 'Bearer') throw new UnauthorizedException('Unauthorized Access');

        // check for token
        const checkToken = token.split(' ')[1];
        if (!checkToken) throw new UnauthorizedException('Unauthorized Access');

        // verify the token
        const verify = await this.jwtService.verifyAsync(checkToken, { secret: process.env.JWT_SECRET });
        if (!verify) throw new UnauthorizedException('Unauthorized Access');
        return true;
    }
}`

const globalCatchBoilerPlate = `import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, response, Response } from 'express'
import { ResponseHandler } from '../utils/response-handler.utils';

@Catch()
export class GlobalCatchHandler implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void {
        try {
            const ctx = host.switchToHttp()
            const response = ctx.getResponse<Response>();
            const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : ""
    
            const httpStatus = exception instanceof HttpException ? exception.getStatus() : exception['statusCode'] || HttpStatus.INTERNAL_SERVER_ERROR;
            let responseBody = {
                statusCode: httpStatus,
                message: exceptionResponse['message'] ? exceptionResponse['message'] : exception.message || "Something went wrong",
                success: (httpStatus == HttpStatus.OK || httpStatus == HttpStatus.CREATED) ? true : false
            }
    
            //For custom error if we provide redirectTo
            if (exceptionResponse['redirectTo'] != "") responseBody['redirectTo'] = exceptionResponse['redirectTo']
            //sending the error response 
            response.status(httpStatus).send(responseBody);
        } catch (error) {
            console.log(error)
            const errorResponse = new ResponseHandler('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR, false)
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorResponse);
        }
    }

}
`;

const globalCatchMainBoilerPlate = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalCatchHandler } from './common/filters/global-catch.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalCatchHandler());
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.enableCors();
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('API Title')
    .setDescription('Api Description')
    .setVersion('1.0')
    .addTag('APIS')
    .addBearerAuth()
    .addServer('http://localhost:4000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
`
const responseInterceptorBoilerPlate = `import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs";
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const response = context.switchToHttp().getResponse();

        // just intercept the status code and data
        return next.handle().pipe(map((data) => {
            // set the response status according to the status code from response body
            response.status(data.statusCode ?? 200)
            return data
        }))
    }
}`;

const responseHandlerBoilerPlate = `export class ResponseHandler {
    message: string;
    statusCode: number;
    data: any;
    success : boolean;

    constructor(message: string, statusCode: number, success: boolean, data ?: any) {
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.success = success;
    }
}
`;

const prismaPostgreSQLBoilerplate = `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}`;

const prismaMySQLBoilerplate = prismaPostgreSQLBoilerplate;

const prismaModuleBoilerplate = `import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';;

@Module({
  imports : [],
  providers: [PrismaService]
})
export class PrismaModule {}`;

const prismaServiceContent = `import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}`;

program
  .command("create <projectName>")
  .description("Generate a new NestJS boilerplate project")
  .action(async (projectName) => {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "database",
        message: "Which database would you like to use?",
        choices: [
          "PostgreSQL",
          "MongoDB",
          "MySQL"
        ]
      }
    ]);

    let selectedOrm = null
    if (answers.database === "PostgreSQL" || answers.database === "MySQL") {
      const askOrm = await inquirer.prompt([
        {
          type: "list",
          name: "orm",
          message: "Which ORM would you like to use?",
          choices: [
            "TypeORM",
            "Prisma"
          ]
        }
      ]);
      selectedOrm = askOrm.orm
    }

    const askJwtAuth = await inquirer.prompt([
      {
        type: "list",
        name: "jwtAuth",
        message: "Would you like to enable JWT authentication?",
        choices: [
          "Passport",
          "Custom"
        ]
      }
    ]);

    const askGlobalCatch = await inquirer.prompt([
      {
        type: "confirm",
        name: "globalCatch",
        message: "Would you like to enable Global Exception Handling?"
      }
    ])


    console.log(chalk.green(`Creating NestJS project: ${projectName}`));
    // Initialize a NestJS project
    execSync(`npx @nestjs/cli new ${projectName} --package-manager npm`, { stdio: "inherit" });

    // Add the common folder
    console.log(chalk.green("Adding common folder..."));
    fs.mkdirSync(path.join(process.cwd(), projectName, "src", "common"));
    fs.mkdirSync(path.join(process.cwd(), projectName, "src", "common", "guards"));
    fs.mkdirSync(path.join(process.cwd(), projectName, "src", "common", "interceptors"));
    fs.mkdirSync(path.join(process.cwd(), projectName, "src", "common", "filters"));
    fs.mkdirSync(path.join(process.cwd(), projectName, "src", "common", "errors"));
    fs.mkdirSync(path.join(process.cwd(), projectName, "src", "common", "utils"));

    console.log(chalk.blue("Installing additional dependencies..."));
    execSync(`cd ${projectName} && npm install @nestjs/config @nestjs/swagger class-validator class-transformer --legacy-peer-deps`, { stdio: "inherit" });

    // Install database specific dependencies
    if (answers.database !== "None") {
      console.log(chalk.blue(`Installing ${answers.database} dependencies...`));
      switch (answers.database) {
        case "PostgreSQL":
          if (selectedOrm === "TypeORM") {
            execSync(`cd ${projectName} && npm install @nestjs/typeorm typeorm pg --legacy-peer-deps`, { stdio: "inherit" });
            fs.writeFileSync(path.join(process.cwd(), projectName, "src", "app.module.ts"), postgreSQLBoilerplate);
            break;
          } else {
            console.log(chalk.blue("Installing Prisma..."));
            execSync(`cd ${projectName} && npm install prisma @prisma/client --legacy-peer-deps`, { stdio: "inherit" })
            execSync(`cd ${projectName} && npx prisma init --datasource-provider postgresql`, { stdio: "inherit" });
            fs.mkdirSync(path.join(process.cwd(), projectName, "src", "prisma"));
            fs.writeFileSync(path.join(process.cwd(), projectName, "src", "app.module.ts"), prismaPostgreSQLBoilerplate);
            fs.writeFileSync(path.join(process.cwd(), projectName, "src", "prisma", "prisma.module.ts"), prismaModuleBoilerplate);
            fs.writeFileSync(path.join(process.cwd(), projectName, "src", "prisma", "prisma.service.ts"), prismaServiceContent);
            break;
          }


        case "MongoDB":
          if (selectedOrm === "TypeORM") {
            execSync(`cd ${projectName} && npm install @nestjs/mongoose mongoose --legacy-peer-deps`, { stdio: "inherit" });
            fs.writeFileSync(path.join(process.cwd(), projectName, "src", "app.module.ts"), mongoDBBoilerPlate);
            break;
          }

        case "MySQL":
          if (selectedOrm === "TypeORM") {
            execSync(`cd ${projectName} && npm install @nestjs/typeorm typeorm mysql2 --legacy-peer-deps`, { stdio: "inherit" });
            fs.writeFileSync(path.join(process.cwd(), projectName, "src", "app.module.ts"), mySQLBoilerPlate);
            break;
          } else {
            console.log(chalk.blue("Installing Prisma..."));
            execSync(`cd ${projectName} && npm install prisma @prisma/client --legacy-peer-deps`, { stdio: "inherit" })
            execSync(`cd ${projectName} && npx prisma init --datasource-provider mysql`, { stdio: "inherit" });
            fs.mkdirSync(path.join(process.cwd(), projectName, "src", "prisma"));
            fs.writeFileSync(path.join(process.cwd(), projectName, "src", "app.module.ts"), prismaMySQLBoilerplate);
            fs.writeFileSync(path.join(process.cwd(), projectName, "src", "prisma", "prisma.module.ts"), prismaModuleBoilerplate);
            fs.writeFileSync(path.join(process.cwd(), projectName, "src", "prisma", "prisma.service.ts"), prismaServiceContent);
            break;
          }
      }
    }

    if (askJwtAuth.jwtAuth != "None") {
      switch (askJwtAuth.jwtAuth) {
        case "Passport":
          execSync(`cd ${projectName} && npm install @nestjs/passport passport passport-jwt @nestjs/jwt passport-local`, { stdio: "inherit" });
          break;
        case "Custom":
          execSync(`cd ${projectName} && npm install @nestjs/jwt --legacy-peer-deps`, { stdio: "inherit" });
          fs.writeFileSync(path.join(process.cwd(), projectName, "src", "common", "guards", "jwt-auth.guard.ts"), jwtBoilerPlate);
          break;
      }
    }

    if (askGlobalCatch.globalCatch) {
      fs.writeFileSync(path.join(process.cwd(), projectName, "src", "common", "filters", "global-catch.filter.ts"), globalCatchBoilerPlate);

    }

    console.log(chalk.blue("Modifying main.ts file..."));

    fs.writeFileSync(path.join(process.cwd(), projectName, "src", "common", "utils", "response-handler.utils.ts"), responseHandlerBoilerPlate);

    askGlobalCatch.globalCatch ?
      fs.writeFileSync(path.join(process.cwd(), projectName, "src", "main.ts"), globalCatchMainBoilerPlate) : fs.writeFileSync(path.join(process.cwd(), projectName, "src", "main.ts"), swaggerBoilerplate);
    fs.writeFileSync(path.join(process.cwd(), projectName, "src", "common", "interceptors", "response.interceptor.ts"), responseInterceptorBoilerPlate);

  });

program.parse(process.argv);
