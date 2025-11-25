/*
 * Gear Box – Sistema de Gestão para Oficinas Mecânicas
 * Copyright (C) 2025 Gear Box
 *
 * Este arquivo é parte do Gear Box.
 * O Gear Box é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da GNU Affero General Public License, versão 3,
 * conforme publicada pela Free Software Foundation.
 *
 * Este programa é distribuído na esperança de que seja útil,
 * mas SEM QUALQUER GARANTIA; sem mesmo a garantia implícita de
 * COMERCIABILIDADE ou ADEQUAÇÃO A UM DETERMINADO FIM.
 * Consulte a GNU AGPLv3 para mais detalhes.
 *
 * Você deve ter recebido uma cópia da GNU AGPLv3 junto com este programa.
 * Caso contrário, veja <https://www.gnu.org/licenses/>.
 */

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

const useSsl = Env.get('DB_SSL', false)
const sslRejectUnauthorized = Env.get('DB_SSL_REJECT_UNAUTHORIZED', false)

const pgConnectionConfig: PostgreConfig = {
  client: 'pg',
  connection: {
    host: Env.get('DB_HOST'),
    port: Env.get('DB_PORT'),
    user: Env.get('DB_USER'),
    password: Env.get('DB_PASSWORD'),
    database: databaseName,
    ssl: useSsl
      ? {
          rejectUnauthorized: sslRejectUnauthorized,
        }
      : undefined,
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
