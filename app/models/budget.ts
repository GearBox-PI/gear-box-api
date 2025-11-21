import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import * as relations from '@adonisjs/lucid/types/relations'
import Client from './client.js'
import Car from './car.js'
import User from './user.js'

export default class Budget extends BaseModel {
  public static table = 'budgets'

  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignId(budget: Budget) {
    if (!budget.id) budget.id = randomUUID()
  }

  @column({ columnName: 'client_id' })
  declare clientId: string

  @column({ columnName: 'car_id' })
  declare carId: string

  @column({ columnName: 'user_id' })
  declare userId: string | null

  @column({ columnName: 'updated_by' })
  declare updatedById: string | null

  @column()
  declare description: string

  @column()
  declare amount: string

  @column()
  declare status: 'aberto' | 'aceito' | 'recusado' | 'cancelado'

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Client)
  declare client: relations.BelongsTo<typeof Client>

  @belongsTo(() => Car)
  declare car: relations.BelongsTo<typeof Car>

  @belongsTo(() => User)
  declare user: relations.BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'updatedById' })
  declare updatedBy: relations.BelongsTo<typeof User>
}
