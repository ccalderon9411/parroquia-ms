import Joi, { ObjectSchema } from 'joi';
export const validationSchema: ObjectSchema<any> = Joi.object({
    PORT: Joi.number().default(3000),
    API_PREFIX: Joi.string().default('API-PREFIX'),
    CONTEXT: Joi.string().default('api'),
    CORS_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
    CORS_CREDENTIALS: Joi.boolean().truthy('true').falsy('false').default(false),
    ORIGINS: Joi.string().default('*'),
    ALLOWED_HEADERS: Joi.string().default('Content-Type, Authorization'),
    ALLOWED_METHODS: Joi.string().default('GET, POST, PUT, DELETE'),
    SWAGGER_PATH: Joi.string().default('docs'),
    SWAGGER_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
});