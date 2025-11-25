import Env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
import type { PostgreConfig } from '@adonisjs/lucid/types/database'

const runningFromBuild = new URL('../', import.meta.url).pathname.includes('/build/')
const databaseName =
  Env.get('NODE_ENV') === 'test' && Env.get('DB_DATABASE_TEST')
    ? Env.get('DB_DATABASE_TEST')
    : Env.get('DB_DATABASE')
const connectionName = Env.get('DB_CONNECTION', 'pg') as 'pg'

const databasePath = (relativePath: string) =>
  runningFromBuild ? `./${relativePath}` : relativePath

const pgConnectionConfig: PostgreConfig = {
  client: 'pg',
  connection: {
    host: Env.get('DB_HOST'),
    port: Env.get('DB_PORT'),
    user: Env.get('DB_USER'),
    password: Env.get('DB_PASSWORD'),
    database: databaseName,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  pool: {
    min: 0,
    max: 10,
  },
  migrations: {
    naturalSort: true,
    paths: [databasePath('database/migrations')],
  },
  seeders: {
    naturalSort: true,
    paths: [databasePath('database/seeders')],
  },
}

const dbConfig = defineConfig({
  connection: connectionName,
  connections: {
    [connectionName]: pgConnectionConfig,
  },
})

export default dbConfig
