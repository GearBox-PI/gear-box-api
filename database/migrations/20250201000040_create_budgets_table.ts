import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateBudgetsTable extends BaseSchema {
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
      table.uuid('client_id').notNullable().references('clients.id').onDelete('CASCADE')
      table.uuid('car_id').notNullable().references('cars.id').onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('users.id').onDelete('RESTRICT')
      table.uuid('created_by').nullable().references('users.id').onDelete('SET NULL')
      table.uuid('updated_by').nullable().references('users.id').onDelete('SET NULL')
      table.text('description').notNullable()
      table.decimal('amount', 12, 2).notNullable()
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

      table.index(['user_id'], 'budgets_user_id_idx')
      table.index(['status'], 'budgets_status_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.raw('DROP TYPE IF EXISTS budget_status')
    })
  }
}
