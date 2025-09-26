// DEPRECATED / NO-OP
// Migration duplicada incompatível (mantida apenas para histórico). Não será executada no fluxo atual.
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'

  async up() {
    const exists = await this.schema.hasTable(this.tableName)
    if (!exists) {
      throw new Error('Tabela auth_access_tokens ausente: use migration original compatível UUID.')
    }
  }

  async down() {
    // No-op.
  }
}
