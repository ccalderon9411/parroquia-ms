// List of environments
const environments: Readonly<Record<string, string>> = {
  test: '.env.test',
  dev: '.env',
  qa: '.env.qa',
  stg: '.env.stg',
  production: '.env.prd',
};

export const getEnvFilePath = (): string[] => {
  const nodeEnv = process.env.NODE_ENV;
  const envFile = nodeEnv ? environments[nodeEnv] : undefined;
  return envFile ? [envFile, '.env'] : ['.env'];
};
