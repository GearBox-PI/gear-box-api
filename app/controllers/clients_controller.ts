import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'
import { createClientValidator, updateClientValidator } from '#validators/clients_validator'

export default class ClientsController {
  // Listar clientes (dono e mecânico)
  async index({ request }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)

    const clients = await Client.query()
      .preload('createdByUser')
      .preload('updatedByUser')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
    return clients
  }

  // Detalhar cliente (dono e mecânico)
  async show({ params, response }: HttpContext) {
    const { id } = params
    const client = await Client.query()
      .where('id', id)
      .preload('createdByUser')
      .preload('updatedByUser')
      .first()
    if (!client) return response.notFound({ error: 'Cliente não encontrado' })
    return client
  }

  // Criar cliente (dono e mecânico)
  async store({ auth, request, response }: HttpContext) {
    const payload = await createClientValidator.validate(request.all())
    const userId = auth.user?.id ?? null
    const client = await Client.create({
      ...payload,
      createdBy: userId,
      updatedBy: userId,
    })
    await client.load('createdByUser')
    await client.load('updatedByUser')
    return response.created(client)
  }

  // Atualizar cliente (apenas dono)
  async update({ auth, params, request, response }: HttpContext) {
    if (!auth.user)
      return response.unauthorized({ error: 'Autenticação necessária' })

    const { id } = params
    const client = await Client.find(id)
    if (!client) return response.notFound({ error: 'Cliente não encontrado' })

    const data = await updateClientValidator.validate(request.all())
    client.merge(data)
    client.updatedBy = auth.user.id
    await client.save()
    await client.load('createdByUser')
    await client.load('updatedByUser')
    return client
  }

  // Remover cliente (apenas dono)
  async destroy({ auth, params, response }: HttpContext) {
    if (auth.user?.tipo !== 'dono')
      return response.forbidden({ error: 'Apenas donos podem remover' })

    const { id } = params
    const client = await Client.find(id)
    if (!client) return response.notFound({ error: 'Cliente não encontrado' })

    await client.delete()
    return response.noContent()
  }
}
