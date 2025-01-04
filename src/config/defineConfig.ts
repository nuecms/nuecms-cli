
interface Prompt {
  type: string;
  name: string;
  message: string;
  choices?: Array<string>;
}

export interface Config {
  cli: {
    page: {
      [key: string]: string
    };
    prompt: {
      [key: string]: Array<Prompt>
    };
  };
}

export function defineConfig(config: Config): Config {
  return config;
}
