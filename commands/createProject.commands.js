import { exec, execSync } from "child_process";
import { promisify } from 'util'
import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";
import path from "path";
import { addGlobalCatchAnimation, additionDependenciesCliAnimation, addSwaggerAnimation, postgreSQLPrismaAddAnimation, postgreSqlTypeOrmAddAnimation } from "../cliAnimations/animation.js";
import { mySQLTypeORMAppModuleBoilerPlate, postgreSQLTypeORMAppModuleBoilerPlate } from "../boilerPlates/orms/TypeORM/sqlBoilerPlate.typeorm.js";
import { prismaMySQLBoilerPlate, prismaPostgreSQLBoilerPlate } from "../boilerPlates/orms/Prisma/sqlBoilerPlate.prisma.js";
import { prismaModule, prismaService } from "../boilerPlates/orms/Prisma/prismaConnectBoilerPlate.js";
import { swaggerBoilerplate, swaggerWithGlobalCatchBoilerplate } from "../boilerPlates/addSwager.js";
import { globalCatchBoilerPlate } from "../boilerPlates/globalCatchHandler.js";
import { responseInterceptorBoilerPlate } from "../boilerPlates/interceptors.js";
import { responseHandlerBoilerPlate } from "../boilerPlates/responseHandler.js";


const execPromise = promisify(exec);

export const createProject = async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter project name:",
    },
    {
      type: "list",
      name: "database",
      message: "Select a database:",
      choices: ["PostgreSQL", "MySQL", "MongoDB"],
    },
    {
      type: "confirm",
      name: "addSwagger",
      message: "Do you want to add Swagger for API documentation?",
    },
    {
      type: "confirm",
      name: "addGlobalCatchHanlder",
      message: "Do you want to add a global exception handler?"
    },
  ]);

  console.log(answers)

  let chooseOrm = null;
  if (answers.database === 'PostgreSQL' || answers.database === 'MySQL') {
    const selectOrm = await inquirer.prompt([
      {
        name: 'orm',
        type: 'list',
        message: 'Select an ORM:',
        choices: ['TypeORM', 'Prisma']
      }
    ])
    chooseOrm = selectOrm.orm;
  }



  console.log("🚀 Creating NestJS project...");
  execSync(`npx @nestjs/cli new ${answers.projectName} --package-manager npm --skip-git`, {
    stdio: 'inherit',  // This is important for interactive CLI
    encoding: 'utf8'
  });

  const projectPath = `./${answers.projectName}/src`;

  // create a comman folder
  fs.mkdirSync(path.join(process.cwd(), projectPath, "common"));
  fs.mkdirSync(path.join(process.cwd(), projectPath, "common", "guards"));
  fs.mkdirSync(path.join(process.cwd(), projectPath, "common", "interceptors"));
  fs.mkdirSync(path.join(process.cwd(), projectPath, "common", "filters"));
  fs.mkdirSync(path.join(process.cwd(), projectPath, "common", "errors"));
  fs.mkdirSync(path.join(process.cwd(), projectPath, "common", "utils"));

  additionDependenciesCliAnimation.start()

  await execPromise(`cd ${answers.projectName} && npm install @nestjs/config@3 class-validator class-transformer`);

  additionDependenciesCliAnimation.stop();

  switch (answers.database) {
    case 'PostgreSQL':
      // check for orm
      if (chooseOrm == 'TypeORM') {
        postgreSqlTypeOrmAddAnimation.start()
        await execPromise(`cd ${answers.projectName} && npm install @nestjs/typeorm typeorm pg`);
        fs.writeFileSync(path.join(process.cwd(), projectPath, "app.module.ts"), postgreSQLTypeORMAppModuleBoilerPlate);
        postgreSqlTypeOrmAddAnimation.stop()
      } else {
        postgreSQLPrismaAddAnimation.start()
        await execPromise(`cd ${answers.projectName} && npm install prisma @prisma/client`, { stdio: "inherit" })
        await execPromise(`cd ${answers.projectName} && npx prisma init --datasource-provider postgresql`, { stdio: "inherit" });
        fs.mkdirSync(path.join(process.cwd(), projectPath, "prisma"));
        fs.writeFileSync(path.join(process.cwd(), projectPath, "app.module.ts"), prismaPostgreSQLBoilerPlate);
        fs.writeFileSync(path.join(process.cwd(), projectPath, "prisma", "prisma.module.ts"), prismaModule);
        fs.writeFileSync(path.join(process.cwd(), projectPath, "prisma", "prisma.service.ts"), prismaService);
        postgreSQLPrismaAddAnimation.stop()
      }
      break;

    case 'MySQL':
      if (chooseOrm == 'TypeORM') {
        postgreSqlTypeOrmAddAnimation.start()
        await execPromise(`cd ${answers.projectName} && npm install @nestjs/typeorm typeorm mysql --legacy-peer-deps`, { stdio: "inherit" });
        fs.writeFileSync(path.join(process.cwd(), projectPath, "app.module.ts"), mySQLTypeORMAppModuleBoilerPlate);
        postgreSqlTypeOrmAddAnimation.stop()
      } else {
        postgreSQLPrismaAddAnimation.start()
        await execPromise(`cd ${answers.projectName} && npm install prisma @prisma/client --legacy-peer-deps`, { stdio: "inherit" })
        await execPromise(`cd ${answers.projectName} && npx prisma init --datasource-provider mysql`, { stdio: "inherit" });
        fs.mkdirSync(path.join(process.cwd(), projectPath, "prisma"));
        fs.writeFileSync(path.join(process.cwd(), projectPath, "app.module.ts"), prismaMySQLBoilerPlate);
        fs.writeFileSync(path.join(process.cwd(), projectPath, "prisma", "prisma.module.ts"), prismaModule);
        fs.writeFileSync(path.join(process.cwd(), projectPath, "prisma", "prisma.service.ts"), prismaService);
        postgreSQLPrismaAddAnimation.stop()
      }
      break;

    case 'MongoDB':
      await execPromise(`cd ${answers.projectName} && npm install @nestjs/mongoose mongoose --legacy-peer-deps`, { stdio: "inherit" });
      fs.writeFileSync(path.join(process.cwd(), projectPath, "app.module.ts"), mySQLTypeORMAppModuleBoilerPlate);
      break;
  }

  // Now for Add Swagger
  if (answers.addSwagger && !answers.addGlobalCatchHanlder) {
    addSwaggerAnimation.start()
    await execPromise(`cd ${answers.projectName} && npm install @nestjs/swagger@7 --legacy-peer-deps`, { stdio: "inherit" });
    fs.writeFileSync(path.join(process.cwd(), projectPath, "main.ts"), swaggerBoilerplate);
    addSwaggerAnimation.stop()
  }

  if (answers.addGlobalCatchHanlder && answers.addSwagger) {
    addGlobalCatchAnimation.start()
    await execPromise(`cd ${answers.projectName} && npm install @nestjs/swagger --legacy-peer-deps`, { stdio: "inherit" });
    fs.writeFileSync(path.join(process.cwd(), projectPath, "main.ts"), swaggerWithGlobalCatchBoilerplate);
    fs.writeFileSync(path.join(process.cwd(), projectPath, "common", "utils", "response-handler.utils.ts"), responseHandlerBoilerPlate);
    fs.writeFileSync(path.join(process.cwd(), projectPath, "common", "filters", "global-catch.filter.ts"), globalCatchBoilerPlate);
    fs.writeFileSync(path.join(process.cwd(), projectPath, "common", "interceptors", "response.interceptor.ts"), responseInterceptorBoilerPlate);
    addGlobalCatchAnimation.stop()
  }

  console.log(chalk.greenBright("\n\n🚀 Your project is ready!"));
}

