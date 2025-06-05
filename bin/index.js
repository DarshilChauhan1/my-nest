#!/usr/bin/env node
import { Command } from "commander";
import { createProject } from '../commands/createProject.commands.js'
import { createSwaggerConfig } from "../commands/createSwaggerConfig.commands.js";
import { createAuth } from "../commands/createAuth.comands.js";
import { generateDto } from "../commands/createDto.commands.js"
import path from "path";
import fs from "fs";
import chalk from "chalk";

const program = new Command();

// Add version information
program
  .version("1.1.2", "-v, --version")
  .description("A CLI for generating NestJS projects and components");

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

// Add help examples
program.addHelpText('after', `
${chalk.yellow('Examples:')}
  $ my-nest create                # Create a new NestJS project
  $ my-nest swagger               # Add Swagger documentation
  $ my-nest auth                  # Add JWT authentication
  $ my-nest generate-dto users    # Generate DTOs for users module

${chalk.blue('For more information, visit:')} 
  https://github.com/DarshilChauhan1/nestjs-cli-boiler-plate
`);

// Handle unknown commands
program.on('command:*', (operands) => {
  console.error(chalk.red(`Error: Unknown command '${operands[0]}'`));
  console.log();
  console.log(`See ${chalk.yellow('my-nest --help')} for a list of available commands.`);
  process.exit(1);
});

// Show help when no command is provided
if (process.argv.length === 2) {
  program.outputHelp();
}

program.parse(process.argv);