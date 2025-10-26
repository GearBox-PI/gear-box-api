import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'
import { createClientValidator, updateClientValidator } from '#validators/clients_validator'

export default class ClientsController {
  // Listar clientes (dono e mecânico)
  async index({ request }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)

    const clients = await Client.query().orderBy('created_at', 'desc').paginate(page, perPage)
    return clients
  }

  // Detalhar cliente (dono e mecânico)
  async show({ params, response }: HttpContext) {
    const { id } = params
    const client = await Client.find(id)
    if (!client) return response.notFound({ error: 'Cliente não encontrado' })
    return client
  }

  // Criar cliente (dono e mecânico)
  async store({ request, response }: HttpContext) {
    const payload = await createClientValidator.validate(request.all())
    const client = await Client.create(payload)
    return response.created(client)
  }

  // Atualizar cliente (apenas dono)
  async update({ auth, params, request, response }: HttpContext) {
    if (auth.user?.tipo !== 'dono')
      return response.forbidden({ error: 'Apenas donos podem atualizar' })

    const { id } = params
    const client = await Client.find(id)
    if (!client) return response.notFound({ error: 'Cliente não encontrado' })

    const data = await updateClientValidator.validate(request.all())
    client.merge(data)
    await client.save()
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
