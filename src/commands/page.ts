import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

async function promptUser(): Promise<{ pageName: string; description: string }> {
  const questions = [
    {
      type: 'input',
      name: 'pageName',
      message: '请输入页面名称：',
      validate: (input: string) => input ? true : '页面名称不能为空',
    },
    {
      type: 'input',
      name: 'description',
      message: '请输入页面描述：',
      validate: (input: string) => input ? true : '页面描述不能为空',
    },
  ];

  const answers = await inquirer.prompt(questions);
  return {
    pageName: answers.pageName,
    description: answers.description,
  };
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
