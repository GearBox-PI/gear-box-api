import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, beforeSave, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { randomUUID } from 'node:crypto'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'senha',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static setId(user: User) {
    if (!user.id) user.id = randomUUID()
  }

  @beforeSave()
  static async hashPasswordOnSave(user: User) {
    const looksHashed = typeof user.senha === 'string' && user.senha.startsWith('scrypt$')
    if (user.$dirty.senha && !looksHashed) {
      user.senha = await hash.make(user.senha)
    }
  }

  @column({ columnName: 'nome' })
  declare nome: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare senha: string

  @column({ columnName: 'tipo' })
  declare tipo: 'dono' | 'mecanico'

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
