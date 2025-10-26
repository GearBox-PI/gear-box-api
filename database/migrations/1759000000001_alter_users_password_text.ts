import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // Postgres: alterar coluna senha para TEXT para comportar hashes longos
    await this.schema.raw('ALTER TABLE users ALTER COLUMN senha TYPE text')
  }

  async down() {
    // Reverte para VARCHAR(255)
    await this.schema.raw('ALTER TABLE users ALTER COLUMN senha TYPE varchar(255)')
  }
}
