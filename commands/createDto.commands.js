import { Project } from "ts-morph";
import * as fs from "fs";
import * as path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import { getDecorators, generateDtoTemplate, toPascalCase, VALID_FILE_NAME_REGEX } from "../utils/generateDtoTemplates.js";

export const generateDto = async (moduleName, outputDir) => {
    const { fileName: entityFileName } = await inquirer.prompt({
        name: "fileName",
        message: "Enter the entity file name :",
        type: "input"
    });

    const { fileName: saveFileName } = await inquirer.prompt({
        name: "fileName",
        message: "Enter the save file name :",
        type: "input",
        validate: (input) => VALID_FILE_NAME_REGEX.test(input) ? true : "File name must start with a letter and can contain only letters, numbers, and hyphens"
    });

    const { askSwagger } = await inquirer.prompt({
        name: "askSwagger",
        message: "Do you want to add swagger properties?",
        type: "confirm"
    });

    const { askOptionalOrRequired } = await inquirer.prompt({
        name : 'askOptionalOrRequired',
        message : "Do you want all fields optional or required",
        type : 'list',
        choices : ['Optional', 'Required']
    })

    const entityPath = path.join(process.cwd(), `src/${moduleName}/entities/${entityFileName}`);

    if (!fs.existsSync(entityPath)) {
        console.log(chalk.red("❌ Entity file does not exist! Please enter the full name of the file."));
        return;
    }

    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(entityPath);
    const classDecl = sourceFile.getClasses()[0];

    if (!classDecl) {
        console.log(chalk.red("❌ No class found in entity file."));
        return;
    }

    console.log(chalk.green(`✔ Found class: ${classDecl.getName()}`));

    let dtoProperties = "";
    classDecl.getProperties().forEach((prop) => {
        const name = prop.getName();
        const type = prop.getType().getText();
        const decorator = getDecorators(name, type, askSwagger, askOptionalOrRequired);
        dtoProperties += `  ${decorator}\n  ${name}: ${type};\n\n`;
    });

    const dtoClassName = toPascalCase(saveFileName);
    const dtoTemplate = generateDtoTemplate(dtoClassName, dtoProperties);

    const dtoPath = path.join(outputDir, `${saveFileName}.dto.ts`);
    fs.writeFileSync(dtoPath, dtoTemplate);

    console.log(chalk.green(`✅ DTO generated: ${dtoPath}`));
};
