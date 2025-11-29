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
import Car from '#models/car'
import Client from '#models/client'
import { createCarValidator, updateCarValidator } from '#validators/cars_validator'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class CarsController {
  // Listar carros (dono e mecânico)
  async index({ request }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)
    const search = String(request.input('search', '')).trim()
    const allowIdSearch = UUID_REGEX.test(search)

    const carsQuery = Car.query().orderBy('created_at', 'desc')

    if (search) {
      const term = `%${search}%`
      carsQuery.where((builder) => {
        builder
          .whereILike('placa', term)
          .orWhereILike('marca', term)
          .orWhereILike('modelo', term)
          if (allowIdSearch) {
            builder.orWhere('id', search)
          }
        builder.orWhere((relationScope) =>
          relationScope.whereHas('client', (clientQuery) => clientQuery.whereILike('nome', term))
        )
      })
    }

    return carsQuery.paginate(page, perPage)
  }

  // Detalhar carro
  async show({ params, response }: HttpContext) {
    const { id } = params
    const car = await Car.find(id)
    if (!car) return response.notFound({ error: 'Carro não encontrado' })
    return car
  }

  // Criar carro (dono e mecânico)
  async store({ request, response }: HttpContext) {
    const payload = await createCarValidator.validate(request.all())

    // Garante que o cliente existe
    const client = await Client.find(payload.clientId)
    if (!client)
      return response.unprocessableEntity({
        errors: [{ field: 'clientId', message: 'Cliente inexistente' }],
      })

    try {
      const car = await Car.create({
        clientId: payload.clientId,
        placa: payload.placa,
        marca: payload.marca,
        modelo: payload.modelo,
        ano: payload.ano,
      })

      return response.created(car)
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = (error as any).code
        if (code === '23505') {
          return response.conflict({ error: 'Placa já cadastrada na base.' })
        }
      }
      throw error
    }
  }

  // Atualizar carro (apenas dono)
  async update({ auth, params, request, response }: HttpContext) {
    if (auth.user?.tipo !== 'dono')
      return response.forbidden({ error: 'Apenas donos podem atualizar' })

    const { id } = params
    const car = await Car.find(id)
    if (!car) return response.notFound({ error: 'Carro não encontrado' })

    const data = await updateCarValidator.validate(request.all())
    car.merge(data)
    await car.save()
    return car
  }

  // Remover carro (apenas dono)
  async destroy({ auth, params, response }: HttpContext) {
    if (auth.user?.tipo !== 'dono')
      return response.forbidden({ error: 'Apenas donos podem remover' })

    const { id } = params
    const car = await Car.find(id)
    if (!car) return response.notFound({ error: 'Carro não encontrado' })

    await car.delete()
    return response.noContent()
  }
}
