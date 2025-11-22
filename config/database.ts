import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const pgConnection = {
  host: env.get('DB_HOST'),
  port: env.get('DB_PORT'),
  user: env.get('DB_USER'),
  password: env.get('DB_PASSWORD'),
  database:
    env.get('NODE_ENV') === 'test' && env.get('DB_DATABASE_TEST')
      ? env.get('DB_DATABASE_TEST')
      : env.get('DB_DATABASE'),
}

if (env.get('DB_SSL', false)) {
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
