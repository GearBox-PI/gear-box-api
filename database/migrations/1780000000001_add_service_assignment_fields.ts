import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.uuid('assigned_to').nullable()
      table.uuid('created_by').nullable()
      table.foreign('assigned_to').references('users.id').onDelete('SET NULL')
      table.foreign('created_by').references('users.id').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropForeign(['assigned_to'])
      table.dropForeign(['created_by'])
      table.dropColumn('assigned_to')
      table.dropColumn('created_by')
    })
  }
}
