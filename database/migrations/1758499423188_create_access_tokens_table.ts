// Migration duplicada (usa tokenable_id integer) conflitante com a versão já aplicada que usa UUID.
// Convertida para NO-OP para não quebrar a cadeia de migrations.
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'

  async up() {
    const exists = await this.schema.hasTable(this.tableName)
    if (!exists) {
      throw new Error(
        'Tabela auth_access_tokens ausente: espere a migration original ou crie correção compatível (UUID).'
      )
    }
  }

  async down() {
    // No-op: não remover a tabela criada pela migration correta.
  }
}
