import path from 'path';
import _ from 'lodash';
import { SequelizeAuto } from '../core/generator/auto';
import { AutoOptions } from '../core/generator/types';
import { loadConfig } from '../config/loadConfig';
import { createResolver } from '../utils/resolve';

const { resolve } = createResolver(import.meta.url);

interface AutoCommandOptions {
  out: string;
  database: string;
  tables?: string[];
  host?: string;
  user: string;
  port?: number;
  password: string;
  template?: string | false;
  prefix?: string;
}

/**
 * Validates required fields for the `auto` command.
 * @param {Partial<AutoOptions>} options - Options to validate.
 * @throws Will throw an error if validation fails.
 */
function validateOptions(options: Partial<AutoOptions>) {
  const requiredFields = ['directory', 'database', 'username', 'password'];
  const missingFields = requiredFields.filter(field => !_.get(options, field));
  if (!_.isEmpty(missingFields)) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Handles the `auto` command logic for generating Sequelize models.
 * @param {AutoCommandOptions} options - The command-line options.
 */
export async function handleAutoCommand(options: AutoCommandOptions): Promise<void> {
  try {
    const config = await loadConfig();
    const defaultTemplate = 'templates/auto/model.ts';

    // Merge options with defaults from config
    const autoOptions = _.merge(
      {
        host: 'localhost',
        dialect: 'mysql',
        lang: 'ts',
        additional: { timestamps: true },
      },
      config?.auto,
      {
        directory: options.out,
        database: options.database,
        username: options.user,
        password: options.password,
        tables: options.tables,
        port: options.port,
        template: options.template,
        prefix: options.prefix,
      }
    ) as AutoOptions;

    autoOptions.useDefine = autoOptions.useDefine ?? config?.auto?.useDefine ?? false;
    autoOptions.singularize = config?.auto?.singularize ?? true;
    if (!autoOptions.template && typeof autoOptions.template !== 'boolean') {
      let templatePath = resolve(defaultTemplate);
      autoOptions.template = templatePath;
    }

    console.log('Generating models with options:', autoOptions);

    // Ensure directory is resolved as an absolute path
    if (autoOptions.directory) {
      autoOptions.directory = path.resolve(autoOptions.directory);
    }

    // Validate required fields
    validateOptions(autoOptions);

    // Initialize SequelizeAuto
    const auto = new SequelizeAuto(
      autoOptions.database as string,
      autoOptions.username as string,
      autoOptions.password as string,
      autoOptions as AutoOptions
    );

    // Generate models
    await auto.run();
    console.log(`Models successfully generated in: ${autoOptions.directory}`);
  } catch (error) {
    console.error('Error generating models:', (error as Error).message);
    process.exit(1); // Exit on error
  }
}
