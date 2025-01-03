#!/usr/bin/env node

import { Command } from 'commander';
import { handleConfCommand } from './commands/conf';
import { handleModCommand } from './commands/mod';
import { handlePageCommand } from './commands/page';

const program = new Command();

program
  .name('nue')
  .description(`NueCMS CLI tools
    For more information, visit https://tools.w3cub.com
  `)
  .version('0.1.0');

program
  .command('conf')
  .description('Dynamically create an SQL statement through prompts and insert it into the database')
  .action(handleConfCommand);

program
  .command('mod')
  .description('Handle the logic for the mod command')
  .action(handleModCommand);

program
  .command('page')
  .description('Handle the logic for the page command')
  .action(handlePageCommand);

program.parse(process.argv);
