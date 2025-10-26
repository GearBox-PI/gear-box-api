import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { createUserValidator, updateUserValidator } from '#validators/users_validator'

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

    const user = await User.create(payload)

    return response.created({
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  // Remove usuário (apenas dono) – segurança: não remove a si mesmo
  async destroy({ auth, params, response }: HttpContext) {
    const { id } = params

    if (auth.user?.tipo !== 'dono') {
      return response.forbidden({ error: 'Apenas donos podem remover usuários.' })
    }

    if (auth.user?.id === id) {
      return response.badRequest({ error: 'Você não pode remover o próprio usuário.' })
    }

    const user = await User.findOrFail(id)
    await user.delete()

    return response.noContent()
  }
}
