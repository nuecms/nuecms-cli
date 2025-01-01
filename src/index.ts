#!/usr/bin/env node

import { Command } from 'commander';
import { handleConf } from './commands/conf';
import { handleMod } from './commands/mod';
import { handlePage } from './commands/page';

const program = new Command();

program
  .name('nue')
  .description('NueCMS CLI 工具')
  .version('0.1.0');

program
  .command('conf')
  .description('通过提示动态创建一条 SQL，并插入数据库')
  .action(handleConf);

program
  .command('mod')
  .description('处理 mod 命令的逻辑')
  .action(handleMod);

program
  .command('page')
  .description('处理 page 命令的逻辑')
  .action(handlePage);

program.parse(process.argv);
