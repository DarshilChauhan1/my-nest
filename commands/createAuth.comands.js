import inquirer from 'inquirer'
import { checkProjectForNestjs } from '../utils/checkNestjs.js';
import fs from 'fs';
import { execPromise } from '../utils/execPromise.js'
import chalk from 'chalk';
import { addJWTAuthAnimation, addPassportAuthAnimation } from '../cliAnimations/animation.js';
import { customJWTboilerPlate } from '../boilerPlates/jwt/custom.jwt.js';
import { JwtAuthModuleConfig } from '../boilerPlates/jwt/moduleConfig.jwt.js';
import { JwtStrategyBoilerPlate } from '../boilerPlates/jwt/jwtStrategy.js';
import { passportWithJwtConfig } from '../boilerPlates/jwt/passportModuleConfig.jwt.js';
import { PassportJwtGuardBoilerPlate } from '../boilerPlates/jwt/passportJwtGuard.jwt.js';
import {  passPortLocalStrategyBoilerPlate } from '../boilerPlates/jwt/passportLocalStrategy.js';

export const createAuth = async () => {
    const checkNest = checkProjectForNestjs();
    if (!checkNest.success) return;

    const { projectRoot, packageJson } = checkNest.data;
    const selectJWTAuth = await inquirer.prompt([
        {
            name: 'auth',
            type: 'list',
            message: 'Select an method for JWT:',
            choices: ['Passport', 'Custom']
        }
    ])

    // check for config dependencies
    if (!packageJson.dependencies['@nestjs/config']) {
        await execPromise(`npm install @nestjs/config@3`)
    }

    switch (selectJWTAuth.auth) {
        case 'Custom': {
            console.log("inside switch")
            // check if there is already @nestjs/jwt installed
            if (packageJson.dependencies['@nestjs/jwt']) {
                console.log(chalk.green('JWT is already installed ✅'));
            } else {
                addJWTAuthAnimation.start();
                await execPromise(`npm install @nestjs/jwt`)
            }

            const jwtFolder = fs.existsSync(`${projectRoot}/src/jwt-auth`);

            if (!jwtFolder) {
                await execPromise(`nest g module jwt-auth --no-spec`);
                await execPromise(`nest g service jwt-auth --no-spec`);
                fs.writeFileSync(`${projectRoot}/src/jwt-auth/jwt-auth.module.ts`, JwtAuthModuleConfig);
                fs.writeFileSync(`${projectRoot}/src/jwt-auth/jwt.guard.ts`, customJWTboilerPlate);
            } else {
                console.log(chalk.red('JWT Folder already exists to avoid conflict please delete the folder and try again!'));
            }
            addJWTAuthAnimation.stop();
        }
            break;

        case 'Passport': {
            try {
                addPassportAuthAnimation.start();
                // check for jwt passport passport-local
                if (!packageJson.dependencies['passport'] || !packageJson.dependencies['passport-local'] || !packageJson.dependencies['@nestjs/passport']) {
                    await execPromise(`npm install --save @nestjs/passport passport passport-local`)
                    await execPromise(`npm install --save-dev @types/passport-local`)
                }

                // check for jwt
                if (!packageJson.dependencies['@nestjs/jwt'] || !packageJson.dependencies['passport-jwt']) {
                    await execPromise(`npm install @nestjs/jwt passport-jwt`)
                    await execPromise(`npm install --save-dev @types/passport-jwt`)
                }

                const jwtFolder = fs.existsSync(`${projectRoot}/src/jwt-auth`);

                if (!jwtFolder) {
                    await execPromise(`nest g module jwt-auth --no-spec`);
                    await execPromise(`nest g service jwt-auth --no-spec`);
                    fs.writeFileSync(`${projectRoot}/src/jwt-auth/jwt-auth.module.ts`, passportWithJwtConfig);
                    fs.writeFileSync(`${projectRoot}/src/jwt-auth/jwt.strategy.ts`, JwtStrategyBoilerPlate);
                    fs.writeFileSync(`${projectRoot}/src/jwt-auth/local.strategy.ts`, passPortLocalStrategyBoilerPlate)
                    fs.writeFileSync(`${projectRoot}/src/jwt-auth/jwt.guard.ts`, PassportJwtGuardBoilerPlate);
                } else {
                    console.log(chalk.red('JWT Folder already exists to avoid conflict please delete the folder and try again!'));
                }

                addPassportAuthAnimation.succeed('Passport Auth Added Successfully! ✅');

            } catch (error) {
                addJWTAuthAnimation.fail('Failed to add Passport Auth! ❌');
            }
            break;
        }
    }
}