// Migration duplicada (layout incompatível com o modelo atual que usa UUID + campos nome/senha/tipo).
// Mantida como NO-OP para preservar ordem histórica sem quebrar execuções futuras.
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // No-op: tabela já criada pela migration correta `1757885146344_create_users_table`.
    const exists = await this.schema.hasTable(this.tableName)
    if (!exists) {
      // Em caso muito improvável de ausência, preferimos não criar um schema divergente automaticamente.
      // Poderia-se lançar erro ou recriar, mas manteremos seguro e explícito.
      throw new Error(
        'Esquema ausente: espere a migration UUID original ou crie uma migration de correção manualmente.'
      )
    }
  }

  async down() {
    // Não derruba a tabela para não afetar o schema vigente.
  }
}
