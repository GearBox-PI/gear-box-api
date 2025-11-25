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

import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
  afterFetch,
  afterFind,
} from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import * as relations from '@adonisjs/lucid/types/relations'
import Service from './service.js'
import Car from './car.js'
import User from './user.js'

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static setId(client: Client) {
    if (!client.id) client.id = randomUUID()
  }

  @column()
  declare nome: string

  @column()
  declare telefone: string

  @column()
  declare email?: string | null

  @column({ columnName: 'created_by' })
  declare createdBy: string | null

  @column({ columnName: 'updated_by' })
  declare updatedBy: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @hasMany(() => Car)
  declare cars: relations.HasMany<typeof Car>

  @hasMany(() => Service)
  declare services: relations.HasMany<typeof Service>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare createdByUser: relations.BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'updatedBy' })
  declare updatedByUser: relations.BelongsTo<typeof User>

  @afterFetch()
  static fillNullAuditColumns(clients: Client[]) {
    clients.forEach((client) => {
      if (typeof client.createdBy === 'undefined') client.createdBy = null
      if (typeof client.updatedBy === 'undefined') client.updatedBy = null
    })
  }

  @afterFind()
  static fillNullAuditColumnsAfterFind(client: Client) {
    if (typeof client.createdBy === 'undefined') client.createdBy = null
    if (typeof client.updatedBy === 'undefined') client.updatedBy = null
  }
}
