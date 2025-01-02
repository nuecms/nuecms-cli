
import fs from 'fs';
import path from 'path';
import { input } from '@inquirer/prompts';

async function promptUser(): Promise<{ moduleName: string; description: string }> {
  const moduleName = await input({
    message: '请输入模块名称：',
    validate: (input: string) => input ? true : '模块名称不能为空',
  });
  const description = await input({
    message: '请输入模块描述：',
    validate: (input: string) => input ? true : '模块描述不能为空',
  });
  return { moduleName, description };
}

function createModuleStructure(moduleName: string, description: string): void {
  const modulePath = path.resolve(process.cwd(), moduleName);
  const moduleFiles = [
    { name: 'index.ts', content: `// ${description}\n\nexport function ${moduleName}() {\n  // TODO: Implement ${moduleName} module\n}` },
    { name: 'README.md', content: `# ${moduleName}\n\n${description}` },
    { name: 'style.css', content: `/* Styles for ${moduleName} module */` },
  ];

  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath);
    console.log(`已创建模块目录：${modulePath}`);
  } else {
    console.log(`模块目录已存在：${modulePath}`);
  }

  moduleFiles.forEach((file) => {
    const filePath = path.join(modulePath, file.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, file.content);
      console.log(`已创建文件：${filePath}`);
    } else {
      console.log(`文件已存在：${filePath}`);
    }
  });
}

export async function handleModCommand(): Promise<void> {
  const { moduleName, description } = await promptUser();
  createModuleStructure(moduleName, description);
}
