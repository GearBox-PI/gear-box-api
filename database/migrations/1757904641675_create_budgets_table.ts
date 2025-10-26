import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'budgets'

  async up() {
    // Garante que o tipo do enum exista (idempotente)
    await this.schema.raw(`
      DO $$ BEGIN
        CREATE TYPE budget_status AS ENUM ('Pendente', 'Aprovado', 'Concluído');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('client_id').notNullable()
      table.uuid('car_id').notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())

      table
        .enum('status', ['Pendente', 'Aprovado', 'Concluído'], {
          useNative: true,
          enumName: 'budget_status',
          existingType: true,
        })
        .notNullable()
        .defaultTo('Pendente')

      table.text('description')
      table.decimal('total_value', 12, 2).notNullable().defaultTo(0)

      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.foreign('client_id').references('clients.id').onDelete('CASCADE')
      table.foreign('car_id').references('cars.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.raw('DROP TYPE IF EXISTS budget_status')
    })
  }
}
