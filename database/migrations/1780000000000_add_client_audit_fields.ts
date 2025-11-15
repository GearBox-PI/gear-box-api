import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clients'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .uuid('created_by')
        .nullable()
        .defaultTo(null)
        .references('users.id')
        .onDelete('SET NULL')
      table
        .uuid('updated_by')
        .nullable()
        .defaultTo(null)
        .references('users.id')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['created_by'])
      table.dropForeign(['updated_by'])
      table.dropColumns('created_by', 'updated_by')
    })
  }
}
