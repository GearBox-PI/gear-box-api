import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import * as relations from '@adonisjs/lucid/types/relations'
import Budget from './budget.js'
import Car from './car.js'

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

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @hasMany(() => Car)
  declare cars: relations.HasMany<typeof Car>

  @hasMany(() => Budget)
  declare budgets: relations.HasMany<typeof Budget>
}
