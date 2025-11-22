import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'budgets'

  async up() {
    await this.schema.raw(`
      DO $$ BEGIN
        CREATE TYPE budget_status AS ENUM ('aberto', 'aceito', 'recusado', 'cancelado');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('client_id').notNullable()
      table.uuid('car_id').notNullable()
      table.uuid('user_id').nullable()
      table.uuid('created_by').nullable()
      table.text('description').notNullable()
      table.decimal('amount', 10, 2).notNullable()
      table.integer('prazo_estimado_dias').nullable()
      table
        .enum('status', ['aberto', 'aceito', 'recusado', 'cancelado'], {
          useNative: true,
          enumName: 'budget_status',
          existingType: true,
        })
        .notNullable()
        .defaultTo('aberto')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.uuid('updated_by').nullable()
      table.foreign('client_id').references('clients.id').onDelete('CASCADE')
      table.foreign('car_id').references('cars.id').onDelete('CASCADE')
      table.foreign('user_id').references('users.id').onDelete('SET NULL')
      table.foreign('created_by').references('users.id').onDelete('SET NULL')
      table.foreign('updated_by').references('users.id').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.raw('DROP TYPE IF EXISTS budget_status')
    })
  }
}
