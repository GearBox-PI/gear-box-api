import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('nome').notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('senha').notNullable()
      table.enum('tipo', ['dono', 'mecanico']).notNullable()
      table.boolean('ativo').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
