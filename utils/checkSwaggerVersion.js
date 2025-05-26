import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const giveNestjsCoreCompatibleSwagger = (projectName) => {
  let projectRoot = process.cwd();
  if (projectName) {
    projectRoot = path.join(projectRoot, projectName);
  }
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const versionMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'version-map.json'), 'utf8'));

  const coreRange = packageJson.dependencies['@nestjs/core'] || packageJson.devDependencies['@nestjs/core'];
  if (!coreRange) {
    console.error('NestJS core not found in package.json');
    return;
  }

  const major = coreRange.match(/(\d+)\./)[1];
  const entry = versionMap.swagger[major];

  if (!entry) {
    console.error(`No compatible swagger version found for NestJS core version ${coreRange}`);
    return;
  }

  const swaggerVersion = entry.version;
  return swaggerVersion;
}