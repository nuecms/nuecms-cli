import fs from 'fs';
import path from 'path';
import { input, select } from '@inquirer/prompts';
import { createResolver } from '../utils/resolve';
import { titleCase } from '../utils/case';
const { resolve } = createResolver(import.meta.url);

// Template file mapping
const templates = {
  frontEnd: {
    'client/pages/{name}.vue': 'templates/mods/views/page.vue',
    'server/controllers/dto/{Name}Dto.ts': 'templates/mods/dto/admin-dto.ts',
    'server/controllers/{Name}.ts': 'templates/mods/controllers/controller.ts',
  },
  admin: {
  'client/pages/admin/{name}.vue': 'templates/mods/views/admin-page.vue',
  'server/controllers/admin/{Name}Controller.ts': 'templates/mods/controllers/controller.ts',
  'server/controllers/admin/dto/{Name}Dto.ts': 'templates/mods/dto/admin-dto.ts',
  },
  default: {
  'server/seeders/{name}.ts': 'templates/mods/seeders/seeder.ts',
  'server/models/{name}.ts': 'templates/mods/models/model.ts'
  }
};

async function promptUser(): Promise<{ moduleName: string; admin: string, frontPage: string }> {
  const moduleName = await input({
    message: 'Please enter the module name:',
    validate: (input: string) => (input ? true : 'Module name cannot be empty'),
  });
  const admin = await select({
    message: 'Is this an admin module?',
    choices: ['Yes', 'No'],
  }) as string;

  const frontPage = await select({
    message: 'Is this the front page?',
    choices: ['Yes', 'No'],
  }) as string;

  return { moduleName, admin, frontPage };
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

export function createModuleStructure({ moduleName, admin, frontPage }: { moduleName: string; admin: string, frontPage: string }): void {
  const caseName = titleCase(moduleName);
  const replacements = {
    moduleName: moduleName,
    ModuleName: caseName
  };
  const isAdmin = admin === 'Yes';
  const isFrontPage = frontPage === 'Yes';
  let  createTemplates = {} as Record<string, string>;
  createTemplates = templates.default;
  if (isAdmin) {
    createTemplates = { ...createTemplates, ...templates.admin };
  }
  if (isFrontPage) {
    createTemplates = { ...createTemplates, ...templates.frontEnd };
  }

  Object.entries(createTemplates).forEach(([target, template]) => {
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
  const { moduleName, admin, frontPage } = await promptUser();
  createModuleStructure({ moduleName, admin, frontPage });
}
