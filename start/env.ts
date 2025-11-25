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

const appRoot = new URL('../', import.meta.url)
const runningFromBuild = appRoot.pathname.includes('/build/')
const allowDotEnvInBuild = process.env.ADONIS_ALLOW_BUILD_DOTENV === 'true'
const shouldSkipDotEnv = runningFromBuild && !allowDotEnvInBuild
const DEFAULT_HOST = process.env.HOST || '0.0.0.0'
const DEFAULT_PORT = Number(process.env.PORT || '8080') || 8080

const schema = {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number.optional(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string.optional({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
  APP_NAME: Env.schema.string.optional(),
  CORS_ALLOWED_ORIGINS: Env.schema.string.optional(),
  HASH_DRIVER: Env.schema.enum.optional(['scrypt', 'bcrypt'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DATABASE_URL: Env.schema.string.optional(),
  DB_HOST: Env.schema.string.optional({ format: 'host' }),
  DB_PORT: Env.schema.number.optional(),
  DB_USER: Env.schema.string.optional(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string.optional(),
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
}

type EnvInstance = InstanceType<typeof Env>

function applyNetworkFallbacks(env: EnvInstance) {
  let host = env.get('HOST')
  if (!host) {
    host = DEFAULT_HOST
    console.warn(`[ENV] HOST missing or invalid. Falling back to "${host}".`)
    env.set('HOST', host)
  }

  let port = Number(env.get('PORT'))
  if (!Number.isFinite(port) || port <= 0) {
    port = DEFAULT_PORT
    console.warn(`[ENV] PORT missing or invalid. Falling back to ${port}.`)
    env.set('PORT', port)
  }
}

function ensureDatabaseConfig(env: EnvInstance) {
  const hasConnectionUrl = !!env.get('DATABASE_URL')
  const hasLegacyConfig =
    !!env.get('DB_HOST') && !!env.get('DB_PORT') && !!env.get('DB_USER') && !!env.get('DB_DATABASE')

  if (!hasConnectionUrl && !hasLegacyConfig) {
    throw new Error(
      '[ENV] Configure DATABASE_URL or complete DB_HOST/DB_PORT/DB_USER/DB_DATABASE variables.'
    )
  }
}

async function createEnv() {
  try {
    if (shouldSkipDotEnv) {
      console.info('[ENV] Running from compiled build — ignoring local .env files.')
      const validator = Env.rules(schema)
      return new Env(validator.validate({}))
    }

    return await Env.create(appRoot, schema)
  } catch (error: any) {
    console.error('[ENV] Failed to load environment variables.')

    if (error?.help) {
      console.error(error.help)
    } else {
      console.error(error)
    }

    throw error
  }
}

const env = await createEnv()

applyNetworkFallbacks(env)
ensureDatabaseConfig(env)

export default env
