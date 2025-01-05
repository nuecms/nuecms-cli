import path from 'path';
import { SequelizeAuto, } from '../core/generator/auto';
import { AutoOptions } from '../core/generator/types';
import { loadConfig } from '../config/loadConfig';
import { createResolver } from '../utils/resolve';

const { resolve } = createResolver(import.meta.url);

/**
 * Command-line options for the `auto` command.
 */
interface AutoCommandOptions {
  out: string; // Output directory for the generated models
  database: string; // Database name
  tables?: string[]; // Optional list of specific tables to generate models for
  host?: string; // Database host (default: 'localhost')
  user: string; // Database user
  port?: number; // Database port
  password: string; // Database password
  template?: string | false; // Template to use for the generated models
  prefix?: string; // Prefix for the generated models
}

/**
 * Handles the `auto` command logic for generating Sequelize models.
 * @param {AutoCommandOptions} options - The command-line options.
 */
export async function handleAutoCommand(options: AutoCommandOptions): Promise<void> {
  const {
    out,
    database,
    tables,
    host = 'localhost',
    user,
    port,
    password,
    template,
  } = options;

  try {
    let autoOptions: AutoOptions = {
      host,
      directory: out,
      port,
      additional: {
        timestamps: false, // Disable timestamps by default in the generated models
      },
      tables,
      template,
      singularize: true,
      useDefine: false,
    };
    const defaultTemplate = 'templates/auto/model.ts'
    const config = await loadConfig();
    autoOptions.host = autoOptions.host || config?.auto?.host;
    autoOptions.port = autoOptions.port || config?.auto?.port;
    autoOptions.database = autoOptions.database || config?.auto?.database;
    autoOptions.username = user || config?.auto?.username;
    autoOptions.password = password || config?.auto?.password;
    autoOptions.template = autoOptions.template || config?.auto?.template;
    autoOptions.prefix = config?.auto?.prefix || options.prefix || '';
    if (!autoOptions.template && typeof autoOptions.template !== 'boolean') {
      let templatePath = resolve(defaultTemplate);
      autoOptions.template = templatePath;
    }
    // lock down the dialect to MySQL
    autoOptions.dialect = 'mysql'; // Default dialect is MySQL
    autoOptions.lang = 'ts'; // Default language is TypeScript
    autoOptions.useDefine = true; // Default to using define for model definitions

    if (autoOptions.directory) {
      autoOptions.directory = path.resolve(autoOptions.directory);
    } else {
      autoOptions.directory = config?.auto?.directory as string
    }

    // Validate required fields
    if (!autoOptions.directory) {
      console.error('Error: Output directory (--out) is required.');
      process.exit(1);
    }

    if (!autoOptions.database) {
      console.error('Error: Database name (--database) is required.');
      process.exit(1);
    }

    if (!autoOptions.username) {
      console.error('Error: Database user (--user) is required.');
      process.exit(1);
    }

    if (!autoOptions.password) {
      console.error('Error: Database password (--password) is required.');
      process.exit(1);
    }

    // Initialize SequelizeAuto
    const auto = new SequelizeAuto(database, autoOptions.username, autoOptions.password, autoOptions);
    // Generate models
    await auto.run();
    console.log(`Models successfully generated in: ${out}`);
  } catch (error: any) {
    console.log(error);
    console.error('Error generating models:', error.message);
  }
}
