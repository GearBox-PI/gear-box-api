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
import demoSandboxService from '#services/demo_sandbox_service'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class CarsController {
  // Listar carros (dono e mecânico)
  async index({ request, auth }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)
    const search = String(request.input('search', '')).trim()
    const allowIdSearch = UUID_REGEX.test(search)

    const carsQuery = Car.query().orderBy('created_at', 'desc')

    if (search) {
      const term = `%${search}%`
      carsQuery.where((builder) => {
        builder.whereILike('placa', term).orWhereILike('marca', term).orWhereILike('modelo', term)
        if (allowIdSearch) {
          builder.orWhere('id', search)
        }
        builder.orWhere((relationScope) =>
          relationScope.whereHas('client', (clientQuery) => clientQuery.whereILike('nome', term))
        )
      })
    }

    if (demoSandboxService.isDemoUser(auth.user)) {
      const dbCars = await carsQuery
      const serialized = dbCars.map((car) => car.serialize())
      const demoCars = demoSandboxService.listCars(auth.user.id, search)
      const combined = [...demoCars, ...serialized].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0
        return dateB - dateA
      })
      return demoSandboxService.paginateArray(combined, page, perPage)
    }

    return carsQuery.paginate(page, perPage)
  }

  // Detalhar carro
  async show({ params, response, auth }: HttpContext) {
    const { id } = params
    if (demoSandboxService.isDemoUser(auth.user)) {
      const car = demoSandboxService.findCar(auth.user.id, id)
      if (car) return car
    }
    const car = await Car.find(id)
    if (!car) return response.notFound({ error: 'Carro não encontrado' })
    return car
  }

  // Criar carro (dono e mecânico)
  async store({ request, response, auth }: HttpContext) {
    const payload = await createCarValidator.validate(request.all())

    if (demoSandboxService.isDemoUser(auth.user)) {
      const result = await demoSandboxService.createCar(auth.user, payload)
      if (result.status === 'validation') {
        return response.unprocessableEntity({ errors: result.errors })
      }
      return response.created(result.data)
    }

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
    if (demoSandboxService.isDemoUser(auth.user)) {
      const data = await updateCarValidator.validate(request.all())
      const updated = demoSandboxService.updateCar(auth.user, params.id, data)
      if (!updated)
        return response.notFound({ error: 'Carro não encontrado na sessão demonstrativa.' })
      return updated
    }

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
    if (demoSandboxService.isDemoUser(auth.user)) {
      const removed = demoSandboxService.deleteCar(auth.user.id, params.id)
      if (!removed)
        return response.notFound({ error: 'Carro não encontrado na sessão demonstrativa.' })
      return response.noContent()
    }

    if (auth.user?.tipo !== 'dono')
      return response.forbidden({ error: 'Apenas donos podem remover' })

    const { id } = params
    const car = await Car.find(id)
    if (!car) return response.notFound({ error: 'Carro não encontrado' })

    await car.delete()
    return response.noContent()
  }
}
