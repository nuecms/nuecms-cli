import inquirer from 'inquirer';
import { executeQuery } from '../utils/database';

interface ConfigData {
  key: string;
  value: string;
}

async function promptUser(): Promise<ConfigData> {
  const questions = [
    {
      type: 'input',
      name: 'key',
      message: '请输入配置项的键名：',
      validate: (input: string) => input ? true : '键名不能为空',
    },
    {
      type: 'input',
      name: 'value',
      message: '请输入配置项的值：',
      validate: (input: string) => input ? true : '值不能为空',
    },
  ];

  const answers = await inquirer.prompt(questions);
  return {
    key: answers.key,
    value: answers.value,
  };
}

async function insertConfigToDatabase(config: ConfigData): Promise<void> {
  const query = 'INSERT INTO config (key, value) VALUES (?, ?)';
  const params = [config.key, config.value];

  try {
    await executeQuery(query, params);
    console.log(`配置项已成功插入：${config.key} = ${config.value}`);
  } catch (error) {
    console.error('插入配置项时出错：', error);
  }
}

export async function handleConfCommand(): Promise<void> {
  const config = await promptUser();
  await insertConfigToDatabase(config);
}
