import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  DATABASE_TYPE: Joi.string().valid('sqlite', 'postgres').default('sqlite'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  API_RATE_LIMIT: Joi.number().default(100),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  node: {
    env: envVars.NODE_ENV,
  },
  server: {
    port: envVars.PORT,
  },
  database: {
    url: envVars.DATABASE_URL,
    type: envVars.DATABASE_TYPE,
  },
  logging: {
    level: envVars.LOG_LEVEL,
  },
  cors: {
    origins: envVars.CORS_ORIGINS.split(',').map((origin: string) => origin.trim()),
  },
  rateLimit: {
    max: envVars.API_RATE_LIMIT,
  },
};