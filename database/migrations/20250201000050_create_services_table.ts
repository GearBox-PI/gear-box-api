import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateServicesTable extends BaseSchema {
  protected tableName = 'services'

  async up() {
    await this.schema.raw(`
      DO $$ BEGIN
        CREATE TYPE service_status AS ENUM ('Pendente', 'Em andamento', 'Concluído', 'Cancelado');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('client_id').notNullable().references('clients.id').onDelete('CASCADE')
      table.uuid('car_id').notNullable().references('cars.id').onDelete('CASCADE')
      table.uuid('budget_id').notNullable().references('budgets.id').onDelete('RESTRICT')
      table.uuid('user_id').notNullable().references('users.id').onDelete('RESTRICT')
      table.uuid('assigned_to').nullable().references('users.id').onDelete('SET NULL')
      table.uuid('created_by').nullable().references('users.id').onDelete('SET NULL')
      table.uuid('updated_by').nullable().references('users.id').onDelete('SET NULL')
      table
        .enum('status', ['Pendente', 'Em andamento', 'Concluído', 'Cancelado'], {
          useNative: true,
          enumName: 'service_status',
          existingType: true,
        })
        .notNullable()
        .defaultTo('Pendente')
      table.text('description').nullable()
      table.decimal('total_value', 12, 2).notNullable().defaultTo(0)
      table.integer('prazo_estimado_dias').nullable()
      table.timestamp('data_prevista', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.index(['user_id'], 'services_user_id_idx')
      table.index(['assigned_to'], 'services_assigned_to_idx')
      table.index(['budget_id'], 'services_budget_id_idx')
      table.index(['status'], 'services_status_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.raw('DROP TYPE IF EXISTS service_status')
    })
  }
}
