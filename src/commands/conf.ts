import { input, select } from '@inquirer/prompts';
import { executeQuery } from '../utils/database';

interface ConfigData {
  varname: string;
  label: string;
  scope: string;
  type: string;
}

async function promptUser(): Promise<any> {
  const label = await input({
    message: 'Please enter the label:',
    validate: (input: string) => input ? true : 'Label cannot be empty',
  });

  const varname = await input({
    message: 'Please enter the configuration key:',
    validate: (input: string) => input ? true : 'Key cannot be empty',
  });
  const scope = await select({
    message: 'Please enter the scope:',
    choices: ['function', 'info', 'openid', 'interface', 'aiconf', 'mail', 'content', 'register', 'integral', 'permission', 'cache']
  });
  const type = await select({
    message: 'Please enter the type:',
    choices: ['select', 'checkbox', 'textarea', 'input', 'upload', 'radio']
  });
  return {
    varname,
    label,
    scope,
    type
  };
}


async function insertConfigToDatabase(config: ConfigData): Promise<void> {
  let query = 'INSERT INTO {prefix}_sys_setting (varname, value, label, scope, created_at, modified_at, ctip, placeholder, options, type, sort) VALUES (?, "s:0:\"\";", ?, ?, NOW(), NOW(), "", "", "s:0:\"\";", ?, 1)';
  query = query.replace('{prefix}', process.env.DB_PREFIX as string);
  const params = [config.varname, config.label, config.scope, config.type];

  try {
    await executeQuery(query, params);
    console.log(`配置项已成功插入：${config.label}`);
  } catch (error) {
    console.error('插入配置项时出错：', error);
  }
}

export async function handleConfCommand(): Promise<void> {
  const config = await promptUser();
  await insertConfigToDatabase(config);
}
