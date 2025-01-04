
interface Prompt {
  type: string;
  name: string;
  message: string;
  choices?: Array<string>;
}


interface AutoConfig {
  dialect: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  directory: string;
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
  auto?: AutoConfig;
}

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}
