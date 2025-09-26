// DEPRECATED / NO-OP
// Migration duplicada incompatível (mantida apenas para histórico). Não será executada no fluxo atual.
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // No-op intencional.
    const exists = await this.schema.hasTable(this.tableName)
    if (!exists) {
      throw new Error('Schema users ausente: use migration UUID principal.')
    }
  }

  async down() {
    // No-op.
  }
}
