import { BaseSchema } from '@adonisjs/lucid/schema'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSchema {
  async up() {
    // Garantir que budgets.user_id esteja preenchido antes de tornar NOT NULL
    await db.raw(`
      UPDATE budgets
      SET user_id = updated_by
      WHERE user_id IS NULL AND updated_by IS NOT NULL
    `)

    // Impede prosseguir caso existam registros inválidos
    const [{ budgets_nulls }] = await db
      .from('budgets')
      .whereNull('user_id')
      .count({ budgets_nulls: '*' })
    if (Number(budgets_nulls) > 0) {
      throw new Error('Corrija budgets.user_id nulo antes de aplicar a constraint NOT NULL')
    }

    const [{ services_user_nulls }] = await db
      .from('services')
      .whereNull('user_id')
      .count({ services_user_nulls: '*' })
    if (Number(services_user_nulls) > 0) {
      throw new Error('Corrija services.user_id nulo antes de aplicar a constraint NOT NULL')
    }

    const [{ services_budget_nulls }] = await db
      .from('services')
      .whereNull('budget_id')
      .count({ services_budget_nulls: '*' })
    if (Number(services_budget_nulls) > 0) {
      throw new Error('Corrija services.budget_id nulo antes de aplicar a constraint NOT NULL')
    }

    this.schema.alterTable('budgets', (table) => {
      table.uuid('user_id').notNullable().alter()
      table.index(['user_id'], 'budgets_user_id_idx')
      table.index(['status'], 'budgets_status_idx')
    })

    this.schema.alterTable('services', (table) => {
      table.uuid('user_id').notNullable().alter()
      table.uuid('budget_id').notNullable().alter()
      table.index(['user_id'], 'services_user_id_idx')
      table.index(['assigned_to'], 'services_assigned_to_idx')
      table.index(['budget_id'], 'services_budget_id_idx')
      table.index(['status'], 'services_status_idx')
    })
  }

  async down() {
    this.schema.alterTable('services', (table) => {
      table.dropIndex(['user_id'], 'services_user_id_idx')
      table.dropIndex(['assigned_to'], 'services_assigned_to_idx')
      table.dropIndex(['budget_id'], 'services_budget_id_idx')
      table.dropIndex(['status'], 'services_status_idx')
      table.uuid('user_id').nullable().alter()
      table.uuid('budget_id').nullable().alter()
    })

    this.schema.alterTable('budgets', (table) => {
      table.dropIndex(['user_id'], 'budgets_user_id_idx')
      table.dropIndex(['status'], 'budgets_status_idx')
      table.uuid('user_id').nullable().alter()
    })
  }
}
