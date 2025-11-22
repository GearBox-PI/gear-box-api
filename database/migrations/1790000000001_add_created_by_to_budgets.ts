import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddCreatedByToBudgets extends BaseSchema {
  protected tableName = 'budgets'

  async up() {
    await this.db.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = '${this.tableName}' AND column_name = 'created_by'
        ) THEN
          ALTER TABLE ${this.tableName} ADD COLUMN created_by uuid NULL;
          ALTER TABLE ${this.tableName}
            ADD CONSTRAINT budgets_created_by_foreign
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
      END$$;
    `)

    await this.db.raw(`UPDATE ${this.tableName} SET created_by = user_id WHERE created_by IS NULL`)
  }

  async down() {
    await this.db.raw(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = '${this.tableName}' AND column_name = 'created_by'
        ) THEN
          ALTER TABLE ${this.tableName} DROP CONSTRAINT IF EXISTS budgets_created_by_foreign;
          ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS created_by;
        END IF;
      END$$;
    `)
  }
}
