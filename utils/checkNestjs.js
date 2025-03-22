import fs from 'fs';
import path from 'path';
import chalk from 'chalk';


export const checkProjectForNestjs = () => {
    const projectRoot = process.cwd();
    const packageJsonPath = path.join(projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.log(chalk.red("❌ package.json not found. Make sure you are in a NestJS project."));
        return {
            success: false
        }
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (!((packageJson.dependencies && packageJson.dependencies['@nestjs/core']) ||
        (packageJson.devDependencies && packageJson.devDependencies['@nestjs/core']))) {
        console.log(chalk.red("❌ This is not a NestJS project. Make sure you are in the root directory of Nestjs Project."));
        return {
            success: false
        }
    }

    return {
        data : {
            packageJson,
            projectRoot
        },
        success: true
    }

}