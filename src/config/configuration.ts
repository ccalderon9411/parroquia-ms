import { registerAs } from "@nestjs/config";
import { AppConfiguration } from "../types/configuration";
import * as PACKAGE_JSON from '../../package.json';


export default registerAs("config", (): AppConfiguration => ({
    project: {
      apiPrefix: process.env.API_PREFIX || 'API-PREFIX',
      name: PACKAGE_JSON.name,
      version: PACKAGE_JSON.version,
      description: PACKAGE_JSON.description,
      author: {
        name: PACKAGE_JSON.author.name,
        url: PACKAGE_JSON.author.url,
        email: PACKAGE_JSON.author.email
      },
      repository: PACKAGE_JSON.repository,
      bugs: PACKAGE_JSON.bugs,
      homepage: PACKAGE_JSON.homepage,
    },
    server: {
        port: Number.parseInt(process.env.PORT || "3000", 10),
        context: process.env.CONTEXT || 'api',
        cors: {
            enabled: process.env.CORS_ENABLED?.toLowerCase() === 'true',
            credentials: process.env.CORS_CREDENTIALS?.toLowerCase() === 'true',
            origins: process.env.ORIGINS ? process.env.ORIGINS.split(',') : '*',
            allowedHeaders: process.env.ALLOWED_HEADERS || 'Content-Type, Authorization',
            allowedMethods: process.env.ALLOWED_METHODS || 'GET, POST, PUT, DELETE',
        }
    },
    swagger: {
      path: process.env.SWAGGER_PATH || 'docs',
      enabled: process.env.SWAGGER_ENABLED?.toLowerCase() === 'true',
    },
}));