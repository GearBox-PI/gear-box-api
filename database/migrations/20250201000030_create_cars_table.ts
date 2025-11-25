import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateCarsTable extends BaseSchema {
  protected tableName = 'cars'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('client_id').notNullable().references('clients.id').onDelete('CASCADE')
      table.string('placa').notNullable().unique()
      table.string('marca').notNullable()
      table.string('modelo').notNullable()
      table.integer('ano').notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
