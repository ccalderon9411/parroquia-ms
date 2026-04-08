// List of environments
const environments = {
  test: '.env.test',
  dev: '.env',
  qa: '.env.qa',
  stg: '.env.stg',
  production: '.env.prd',
};

export const getEnvFilePath = (): string[] => {
  const envFile = environments[process.env.NODE_ENV ?? ''];
  return envFile ? [envFile, '.env'] : ['.env'];
};
