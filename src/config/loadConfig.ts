import path from 'path';
import { existsSync } from 'fs';
import { loadConfigFromFile } from 'vite';
import { Config } from './defineConfig';


const DEFAULT_CONFIG_PATH = 'nue.config.ts';

export async function loadConfig(configPath: string = DEFAULT_CONFIG_PATH): Promise<Config | null> {
  const resolvedPath = path.resolve(process.cwd(), configPath);

  if (!existsSync(resolvedPath)) {
    console.warn(`Config file not found at: ${resolvedPath}`);
    return null;
  }

  const result = await loadConfigFromFile({ command: 'serve', mode: 'development' }, resolvedPath);

  if (!result || !result.config) {
    throw new Error(`Failed to load configuration from ${resolvedPath}`);
  }

  return result.config as Config;
}
