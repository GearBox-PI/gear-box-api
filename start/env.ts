/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
  APP_NAME: Env.schema.string.optional(),
  CORS_ALLOWED_ORIGINS: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  // Banco de testes (opcional). Se definido e NODE_ENV=test, será utilizado no lugar de DB_DATABASE
  DB_DATABASE_TEST: Env.schema.string.optional(),
  DB_SSL: Env.schema.boolean.optional(),
  DB_SSL_REJECT_UNAUTHORIZED: Env.schema.boolean.optional(),

  /*
  |--------------------------------------------------------------------------
  | Mail
  |--------------------------------------------------------------------------
  */
  MAIL_HOST: Env.schema.string({ format: 'host' }),
  MAIL_PORT: Env.schema.number(),
  MAIL_USERNAME: Env.schema.string.optional(),
  MAIL_PASSWORD: Env.schema.string.optional(),
  MAIL_FROM: Env.schema.string.optional(),
  MAIL_SECURE: Env.schema.boolean.optional(),
  MAIL_IGNORE_TLS: Env.schema.boolean.optional(),
})
