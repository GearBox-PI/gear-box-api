import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { createSessionValidator } from '#validators/session_validator'
import { getAbilitiesForRole } from '#abilities/token_abilities'

export default class SessionController {
  async store({ request }: HttpContext) {
    // Validação do payload (gera erro que será tratado pelo handler de exceções adaptado)
    const { email, password } = await createSessionValidator.validate(request.all())

    // Verifica credenciais (usa passwordColumnName = 'senha' definido no AuthFinder)
    const user = await User.verifyCredentials(email, password)

    // Cria token de acesso com abilities específicas do perfil
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
}
