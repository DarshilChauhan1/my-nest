#!/usr/bin/env node
import { Command } from "commander";
import { createProject } from '../commands/createProject.commands.js'
import { createSwaggerConfig } from "../commands/createSwaggerConfig.commands.js";
import { createAuth } from "../commands/createAuth.comands.js";
import {generateDto} from "../commands/createDto.commands.js"
import path from "path";
import fs from "fs";

const program = new Command();

program
  .command("create")
  .description("Create a new NestJS project")
  .action(createProject);


program
  .command("swagger")
  .description("Create Swagger documentation")
  .action(createSwaggerConfig);

program
  .command("auth")
  .description("Create JWT Authentication")
  .action((moduleName) => createAuth(moduleName));

program
  .command("generate-dto <moduleName>")
  .description("Generate DTO from entity")
  .action((moduleName) => {
    const outputDir = path.join(process.cwd(), `src/${moduleName}/dto`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    generateDto(moduleName, outputDir);
  });

program.parse(process.argv);