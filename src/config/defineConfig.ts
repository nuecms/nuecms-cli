import prettier from "prettier";

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
  directory?: string;
  template?: string;
  prefix?: string;
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
  prettier?: prettier.Options;
}

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}
