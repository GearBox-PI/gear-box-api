import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { createSessionValidator } from '#validators/session_validator'
import { getAbilitiesForRole } from '#abilities/token_abilities'
import db from '@adonisjs/lucid/services/db'

export default class SessionController {
  async store({ request }: HttpContext) {
    const { email, password } = await createSessionValidator.validate(request.all())

    const user = await User.verifyCredentials(email, password)

    const abilities = getAbilitiesForRole(user.tipo)
    const token = await User.accessTokens.create(user, abilities)

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
      token: {
        type: token.type,
        value: token.value,
        abilities: token.abilities,
        expiresAt: token.expiresAt,
      },
    }
  }

  /**
   * Logout: revoga todos os tokens do usuário autenticado
   * (simples e eficaz para APIs de primeiro partido). Retorna 204.
   */
  async destroy({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized({ error: 'Not authenticated' })

    await db.from('auth_access_tokens').where('tokenable_id', user.id).delete()

    return response.noContent()
  }
}
