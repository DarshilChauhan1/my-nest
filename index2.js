#!/usr/bin/env node
import { Command } from "commander";
import { createProject } from './commands/createProject.commands.js'
import { createSwaggerConfig } from "./commands/createSwaggerConfig.js";

const program = new Command();

program
  .command("create")
  .description("Create a new NestJS project")
  .action(createProject);


program
  .command("swagger")
  .description("Create Swagger documentation")
  .action(createSwaggerConfig);

program.parse(process.argv);