import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import Client from './client.js'
import Service from './service.js'
import * as relations from '@adonisjs/lucid/types/relations'

export default class Car extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static setId(car: Car) {
    if (!car.id) car.id = randomUUID()
  }

  @column({ columnName: 'client_id' })
  declare clientId: string

  @column()
  declare placa: string

  @column()
  declare marca: string

  @column()
  declare modelo: string

  @column()
  declare ano: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Client)
  declare client: relations.BelongsTo<typeof Client>

  @hasMany(() => Service)
  declare services: relations.HasMany<typeof Service>
}
