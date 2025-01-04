import path from 'path';
import { SequelizeAuto,  } from '../core/generator/auto';
import { AutoOptions } from '../core/generator/types';

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
    password
  } = options;

  // Validate required fields
  if (!out) {
    console.error('Error: Output directory (--out) is required.');
    process.exit(1);
  }

  if (!database) {
    console.error('Error: Database name (--database) is required.');
    process.exit(1);
  }

  if (!user) {
    console.error('Error: Database user (--user) is required.');
    process.exit(1);
  }

  if (!password) {
    console.error('Error: Database password (--password) is required.');
    process.exit(1);
  }

  try {
    const autoOptions: AutoOptions = {
      host,
      directory: path.resolve(out),
      port,
      additional: {
        timestamps: false, // Disable timestamps by default in the generated models
      },
      tables,
      singularize: true,
      useDefine: false,
    };

    // Initialize SequelizeAuto
    const auto = new SequelizeAuto(database, user, password, autoOptions);

    // Generate models
    await auto.run();

    console.log(`Models successfully generated in: ${out}`);
  } catch (error: any) {
    console.error('Error generating models:', error.message);
  }
}
