import prettier from "prettier";
// import { AutoOptions } from "../core/generator/types";

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
  template?: string | false;
  prefix?: string;
  useDefine?: boolean;
  singularize?: boolean;
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
  aiConfig?: {
    baseURL: string;
    apiKey: string;
    model: string;
  };
  jsonsql?: {
    ai: boolean;
    prompt?: string;
  };
}

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}
