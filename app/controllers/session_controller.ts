/*
 * Gear Box – Sistema de Gestão para Oficinas Mecânicas
 * Copyright (C) 2025 Gear Box
 *
 * Este arquivo é parte do Gear Box.
 * O Gear Box é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da GNU Affero General Public License, versão 3,
 * conforme publicada pela Free Software Foundation.
 *
 * Este programa é distribuído na esperança de que seja útil,
 * mas SEM QUALQUER GARANTIA; sem mesmo a garantia implícita de
 * COMERCIABILIDADE ou ADEQUAÇÃO A UM DETERMINADO FIM.
 * Consulte a GNU AGPLv3 para mais detalhes.
 *
 * Você deve ter recebido uma cópia da GNU AGPLv3 junto com este programa.
 * Caso contrário, veja <https://www.gnu.org/licenses/>.
 */

import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { createSessionValidator } from '#validators/session_validator'
import { getAbilitiesForRole } from '#abilities/token_abilities'
import db from '@adonisjs/lucid/services/db'

export default class SessionController {
  async store({ request, response }: HttpContext) {
    // Validação do payload (gera erro que será tratado pelo handler de exceções adaptado)
    const { email, password } = await createSessionValidator.validate(request.all())

    // Usa o método verifyCredentials do AuthFinder que já está configurado no modelo
    const user = await User.verifyCredentials(email, password)

    if (!user.ativo) {
      return response.unauthorized({ error: 'Usuário desativado.' })
    }

    // Cria token de acesso com abilities específicas do perfil
    const abilities = getAbilitiesForRole(user.tipo)
    const token = await User.accessTokens.create(user, abilities)

    // Em AdonisJS, valores sensíveis podem ser do tipo Secret e redigidos em JSON.
    // Usamos release() quando existir para obter o valor real do token.
    const tokenValue: string =
      typeof (token as any).value?.release === 'function'
        ? (token as any).value.release()
        : (token as any).value

    // Define o header Authorization para conveniência dos clientes
    response.header('Authorization', `Bearer ${tokenValue}`)

    return {
      user: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo },
      token: {
        type: token.type,
        value: tokenValue,
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
