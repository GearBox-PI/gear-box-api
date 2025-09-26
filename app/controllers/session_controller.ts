import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async store({ request }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    // Verifica credenciais (usa passwordColumnName = 'senha' definido no AuthFinder)
    const user = await User.verifyCredentials(email, password)

    // Cria token de acesso (todas as abilities por enquanto)
    const token = await User.accessTokens.create(user, ['*'])

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
}
