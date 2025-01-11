import fs from 'fs';
import path from 'path';
import { input, select } from '@inquirer/prompts';
import { loadConfig } from '../config/loadConfig';

type PageConf = {
  pageName: string;
  targetPath: string;
};

async function promptUser(config: any): Promise<PageConf> {
  const pageName = await input({
    message: 'Enter the name of the template:',
    validate: (input) => {
      if (!input) {
        return 'Page name cannot be empty';
      }
      return true;
    },
  });
  const targetPath = await input({
    message: 'Enter the path of the page:',
    validate: (input) => {
      if (!input) {
        return 'Page path cannot be empty';
      }
      return true;
    },
  });

  const customPrompts = config.page[pageName]
    ? config.page[pageName].prompt
    : [];
  const customObj = {} as Record<string, string>;
  for (const prompt of customPrompts) {
    if (prompt.type === 'input') {
      const response = await input({
        message: prompt.message,
        validate: (input) => {
          if (!input) {
            return 'Response cannot be empty';
          }
          return true;
        },
      });
      customObj[prompt.name] = response as string;
    } else if (prompt.type === 'select') {
      const response = await select({
        message: prompt.message,
        choices: prompt.choices,
      });
      customObj[prompt.name] = response as string;
    }
  }
  return { pageName, targetPath, ...customObj };
}

async function createPageStructure(options: PageConf, config: any): Promise<void> {
  const { pageName, targetPath } = options;

  const page = config?.page[pageName];
  if (!page) {
    throw new Error(`Page name "${pageName}" is not defined in the nue.config.ts configuration.`);
  }
  const templatePath = path.resolve(process.cwd(), page.template);
  const content = fs.readFileSync(templatePath, 'utf-8');
  const filePath = path.resolve(process.cwd(), targetPath);
  const pagePath = path.dirname(filePath);

  if (!fs.existsSync(pagePath)) {
    fs.mkdirSync(pagePath);
    console.log(`Page directory created: ${pagePath}`);
  } else {
    console.log(`Page directory already exists: ${pagePath}`);
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`File created: ${filePath}`);
  } else {
    console.log(`File already exists: ${filePath}`);
  }
}

export async function handlePageCommand(): Promise<void> {
  const config = await loadConfig();
  const conf = await promptUser(config);
  createPageStructure(conf, config);
}
