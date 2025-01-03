import fs from 'fs';
import path from 'path';
import { input } from '@inquirer/prompts';

// Template file mapping
const templates = {
  'seeders/{name}.ts': 'src/templates/mods/seeders/seeder.ts',
  'views/{{name}}.vue': 'src/templates/mods/views/page.vue',
  'models/{{name}}.ts': 'src/templates/mods/models/model.ts',
  'controllers/{{name}}.ts': 'src/templates/mods/controllers/controller.ts',
};

async function promptUser(): Promise<{ moduleName: string; description: string }> {
  const moduleName = await input({
    message: 'Please enter the module name:',
    validate: (input: string) => (input ? true : 'Module name cannot be empty'),
  });
  const description = await input({
    message: 'Please enter the module description:',
    validate: (input: string) => (input ? true : 'Module description cannot be empty'),
  });
  return { moduleName, description };
}

function createFileFromTemplate(target: string, template: string, replacements: Record<string, string>): void {
  const content = fs.readFileSync(template, 'utf-8');
  const replacedContent = Object.keys(replacements).reduce((acc, key) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
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

function createModuleStructure(moduleName: string, description: string): void {
  const replacements = {
    moduleName,
    description,
  };

  Object.entries(templates).forEach(([target, template]) => {
    const targetPath = path.resolve(process.cwd(), target.replace('xxx', moduleName));
    const templatePath = path.resolve(process.cwd(), template);

    if (fs.existsSync(templatePath)) {
      createFileFromTemplate(targetPath, templatePath, replacements);
    } else {
      console.log(`Template file does not exist: ${templatePath}`);
    }
  });
}

export async function handleModCommand(): Promise<void> {
  const { moduleName, description } = await promptUser();
  createModuleStructure(moduleName, description);
}
