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
import { createUserValidator, updateUserValidator } from '#validators/users_validator'
import db from '@adonisjs/lucid/services/db'

export default class UsersController {
  // Lista usuários (apenas dono)
  async index({ auth, request, response }: HttpContext) {
    if (auth.user?.tipo !== 'dono') {
      return response.forbidden({ error: 'Apenas donos podem listar usuários.' })
    }

    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)

    const users = await User.query().paginate(page, perPage)
    return users
  }

  // Detalha usuário: dono pode ver qualquer; mecânico apenas o próprio
  async show({ auth, params, response }: HttpContext) {
    const { id } = params

    if (auth.user?.tipo !== 'dono' && auth.user?.id !== id) {
      return response.forbidden({ error: 'Sem permissão para visualizar este usuário.' })
    }

    const user = await User.findOrFail(id)
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      ativo: user.ativo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  // Cria usuário (apenas dono)
  async store({ auth, request, response }: HttpContext) {
    if (auth.user?.tipo !== 'dono') {
      return response.forbidden({ error: 'Apenas donos podem criar usuários.' })
    }

    const payload = await createUserValidator.validate(request.all())

    // Checagem simples de e-mail único
    const emailTaken = await User.findBy('email', payload.email)
    if (emailTaken) {
      return response.unprocessableEntity({ errors: [{ message: 'E-mail já está em uso.' }] })
    }

    const user = await User.create({
      ...payload,
      ativo: payload.ativo ?? true,
    })

    return response.created({
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      ativo: user.ativo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  // Atualiza usuário: dono qualquer; mecânico apenas o próprio (restrito a nome/senha)
  async update({ auth, params, request, response }: HttpContext) {
    const { id } = params

    const isOwner = auth.user?.tipo === 'dono'
    const isSelf = auth.user?.id === id

    if (!isOwner && !isSelf) {
      return response.forbidden({ error: 'Sem permissão para atualizar este usuário.' })
    }

    const data = await updateUserValidator.validate(request.all())

    const user = await User.findOrFail(id)

    // Se mudar e-mail, checar unicidade
    if (data.email && data.email !== user.email) {
      const emailTaken = await User.findBy('email', data.email)
      if (emailTaken) {
        return response.unprocessableEntity({ errors: [{ message: 'E-mail já está em uso.' }] })
      }
    }

    if (isOwner) {
      // dono pode alterar tudo
      if (typeof data.nome !== 'undefined') user.nome = data.nome
      if (typeof data.email !== 'undefined') user.email = data.email
      if (typeof data.senha !== 'undefined') user.senha = data.senha
      if (typeof data.tipo !== 'undefined') user.tipo = data.tipo
      if (typeof data.ativo !== 'undefined') user.ativo = data.ativo
    } else if (isSelf) {
      // mecânico só pode alterar nome/senha do próprio
      if (typeof data.nome !== 'undefined') user.nome = data.nome
      if (typeof data.senha !== 'undefined') user.senha = data.senha
      // Ignora alterações em email/tipo
    }

    await user.save()

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      ativo: user.ativo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  // Remove usuário (apenas dono). Mecânicos são desativados com opção de transferência.
  async destroy({ auth, params, request, response }: HttpContext) {
    const { id } = params

    if (auth.user?.tipo !== 'dono') {
      return response.forbidden({ error: 'Apenas donos podem remover usuários.' })
    }

    const adminId = auth.user?.id ?? null

    const user = await User.findOrFail(id)

    if (user.tipo === 'mecanico') {
      const transferToUserId = request.input('transferToUserId')

      if (transferToUserId) {
        if (transferToUserId === user.id) {
          return response.badRequest({ error: 'Não é possível transferir para o mesmo usuário.' })
        }

        const targetMechanic = await User.query()
          .where('id', transferToUserId)
          .where('tipo', 'mecanico')
          .where('ativo', true)
          .first()

        if (!targetMechanic) {
          return response.badRequest({ error: 'Mecânico de destino inválido ou inativo.' })
        }

        await db
          .from('budgets')
          .where('user_id', user.id)
          .update({ user_id: targetMechanic.id, updated_by: adminId })

        await db.from('services').where('user_id', user.id).update({
          user_id: targetMechanic.id,
          assigned_to: targetMechanic.id,
          updated_by: adminId,
        })

        await db
          .from('services')
          .where('assigned_to', user.id)
          .update({ assigned_to: targetMechanic.id, updated_by: adminId })
      }

      user.ativo = false
      await user.save()
      await db.from('auth_access_tokens').where('tokenable_id', user.id).delete()

      return response.ok({ message: 'Mecânico desativado com sucesso.' })
    }

    const isSelfRemoval = auth.user?.id === user.id

    await user.delete()
    await db.from('auth_access_tokens').where('tokenable_id', user.id).delete()

    if (isSelfRemoval) {
      return response.ok({ message: 'Conta removida com sucesso.' })
    }

    return response.noContent()
  }
}
