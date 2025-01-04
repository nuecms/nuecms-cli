
interface Prompt {
  type: string;
  name: string;
  message: string;
  choices?: Array<string>;
}


interface DatabaseConfig {
  dialect: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface UserConfig {
  cli: {
    page: {
      [key: string]: string
    };
    prompt?: {
      [key: string]: Array<Prompt>
    };
  };
  database?: DatabaseConfig;
}

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}
