import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateClientsTable extends BaseSchema {
  protected tableName = 'clients'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('nome').notNullable()
      table.string('telefone').notNullable()
      table.string('email').nullable().unique()
      table.uuid('created_by').nullable().references('users.id').onDelete('SET NULL')
      table.uuid('updated_by').nullable().references('users.id').onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
