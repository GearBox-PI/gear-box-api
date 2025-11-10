import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import Client from './client.js'
import Car from './car.js'
import * as relations from '@adonisjs/lucid/types/relations'

export default class Service extends BaseModel {
  public static table = 'services'

  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static setId(service: Service) {
    if (!service.id) service.id = randomUUID()
  }

  @column({ columnName: 'client_id' })
  declare clientId: string

  @column({ columnName: 'car_id' })
  declare carId: string

  @column()
  declare status: 'Pendente' | 'Em andamento' | 'Concluído' | 'Cancelado'

  @column()
  declare description?: string | null

  @column({ columnName: 'total_value' })
  declare totalValue: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Client)
  declare client: relations.BelongsTo<typeof Client>

  @belongsTo(() => Car)
  declare car: relations.BelongsTo<typeof Car>
}
