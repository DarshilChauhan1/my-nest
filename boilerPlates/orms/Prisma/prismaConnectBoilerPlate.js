export const prismaModule = `import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';;

@Module({
  imports : [],
  providers: [PrismaService]
})
export class PrismaModule {}`

export const prismaService = `import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
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
}`