import fs from 'fs';
import path from 'path';
import { input } from '@inquirer/prompts';

async function promptUser(): Promise<{ pageName: string; description: string }> {
  const pageName = await input({
      message: 'Enter the name of the page:',
      validate: (input) => {
        if (!input) {
          return 'Page name cannot be empty';
        }
        return true;
      },
    });
    // description
    const description = await input({
      message: 'Enter a description for the page:',
      validate: (input) => {
        if (!input) {
          return 'Description cannot be empty';
        }
        return true;
      },
    });
    return { pageName, description };
}

function createPageStructure(pageName: string, description: string): void {
  const pagePath = path.resolve(process.cwd(), pageName);
  const pageFiles = [
    { name: 'index.ts', content: `// ${description}\n\nexport function ${pageName}() {\n  // TODO: Implement ${pageName} page\n}` },
    { name: 'README.md', content: `# ${pageName}\n\n${description}` },
    { name: 'style.css', content: `/* Styles for ${pageName} page */` },
  ];

  if (!fs.existsSync(pagePath)) {
    fs.mkdirSync(pagePath);
    console.log(`已创建页面目录：${pagePath}`);
  } else {
    console.log(`页面目录已存在：${pagePath}`);
  }

  pageFiles.forEach((file) => {
    const filePath = path.join(pagePath, file.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, file.content);
      console.log(`已创建文件：${filePath}`);
    } else {
      console.log(`文件已存在：${filePath}`);
    }
  });
}

export async function handlePageCommand(): Promise<void> {
  const { pageName, description } = await promptUser();
  createPageStructure(pageName, description);
}
