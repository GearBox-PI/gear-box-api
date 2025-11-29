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

import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'
import { createClientValidator, updateClientValidator } from '#validators/clients_validator'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class ClientsController {
  // Listar clientes (dono e mecânico)
  async index({ request }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)
    const search = String(request.input('search', '')).trim()
    const allowIdSearch = UUID_REGEX.test(search)

    const clientsQuery = Client.query()
      .preload('createdByUser')
      .preload('updatedByUser')
      .orderBy('created_at', 'desc')

    if (search) {
      const term = `%${search}%`
      clientsQuery.where((builder) => {
        builder
          .whereILike('nome', term)
          .orWhereILike('email', term)
          .orWhereILike('telefone', term)
          if (allowIdSearch) {
            builder.orWhere('id', search)
          }
        builder.orWhere((relationScope) =>
          relationScope.whereHas('cars', (carQuery) =>
            carQuery
              .whereILike('placa', term)
              .orWhereILike('marca', term)
              .orWhereILike('modelo', term)
          )
        )
      })
    }

    return clientsQuery.paginate(page, perPage)
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
    if (!auth.user) return response.unauthorized({ error: 'Autenticação necessária' })
    if (auth.user.tipo !== 'dono')
      return response.forbidden({ error: 'Apenas donos podem atualizar' })

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
