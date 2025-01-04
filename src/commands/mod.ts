import fs from 'fs';
import path from 'path';
import { input, select } from '@inquirer/prompts';
import { createResolver } from '../utils/resolve';
const { resolve } = createResolver(import.meta.url);

// Template file mapping
const templates = {
  'client/pages/admin/{name}.vue': 'templates/mods/views/admin-page.vue',
  'client/pages/{name}.vue': 'templates/mods/views/page.vue',
  'server/seeders/{name}.ts': 'templates/mods/seeders/seeder.ts',
  'server/models/{name}.ts': 'templates/mods/models/model.ts',
  'server/controllers/{Name}.ts': 'templates/mods/controllers/controller.ts',
  'server/controllers/admin/{Name}Controller.ts': 'templates/mods/controllers/controller.ts',
  'server/controllers/admin/dto/{Name}Dto.ts': 'templates/mods/dto/admin-dto.ts',
  'server/controllers/dto/{Name}Dto.ts': 'templates/mods/dto/admin-dto.ts',
};

async function promptUser(): Promise<{ moduleName: string; admin: string }> {
  const moduleName = await input({
    message: 'Please enter the module name:',
    validate: (input: string) => (input ? true : 'Module name cannot be empty'),
  });
  const admin = await select({
    message: 'Is this an admin module?',
    choices: ['Yes', 'No'],
  }) as string;
  return { moduleName, admin };
}

function createFileFromTemplate(target: string, template: string, replacements: Record<string, string>): void {
  const content = fs.readFileSync(template, 'utf-8');
  const replacedContent = Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), replacements[key]); // Match {{key}}
  }, content);

  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, replacedContent);
    console.log(`File created: ${target}`);
  } else {
    console.log(`File already exists: ${target}`);
  }
}

export function createModuleStructure(moduleName: string, admin: string): void {
  const caseName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const replacements = {
    moduleName: moduleName,
    ModuleName: caseName
  };

  const isAdmin = admin === 'Yes';

  Object.entries(templates).forEach(([target, template]) => {
    // Skip admin files if module is not admin
    if (target.includes('admin') && !isAdmin) {
      return
    }
    const targetPath = path.resolve(
      process.cwd(),
      target.replace('{name}', moduleName).replace('{Name}', caseName)
    );

    let templatePath = resolve(template);
    if (fs.existsSync(templatePath)) {
      createFileFromTemplate(targetPath, templatePath, replacements);
    } else {
      console.log(`Template file does not exist: ${templatePath}`);
    }
  });
}

export async function handleModCommand(): Promise<void> {
  const { moduleName, admin } = await promptUser();
  createModuleStructure(moduleName, admin);
}
