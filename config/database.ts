import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const usingConnectionString = !!env.get('DATABASE_URL')

const pgConnection: Record<string, any> = usingConnectionString
  ? {
      connectionString: env.get('DATABASE_URL'),
    }
  : {
      host: env.get('DB_HOST'),
      port: env.get('DB_PORT'),
      user: env.get('DB_USER'),
      password: env.get('DB_PASSWORD'),
      database:
        env.get('NODE_ENV') === 'test' && env.get('DB_DATABASE_TEST')
          ? env.get('DB_DATABASE_TEST')
          : env.get('DB_DATABASE'),
    }

const shouldUseSsl = env.get('DB_SSL', usingConnectionString)

if (shouldUseSsl) {
  Object.assign(pgConnection, {
    ssl: {
      rejectUnauthorized: env.get('DB_SSL_REJECT_UNAUTHORIZED', false),
    },
  })
}

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: pgConnection,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
