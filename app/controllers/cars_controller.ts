import type { HttpContext } from '@adonisjs/core/http'
import Car from '#models/car'
import Client from '#models/client'
import { createCarValidator, updateCarValidator } from '#validators/cars_validator'

export default class CarsController {
  // Listar carros (dono e mecânico)
  async index({ request }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)

    const cars = await Car.query().orderBy('created_at', 'desc').paginate(page, perPage)
    return cars
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

    const car = await Car.create({
      clientId: payload.clientId,
      placa: payload.placa,
      marca: payload.marca,
      modelo: payload.modelo,
      ano: payload.ano,
    })

    return response.created(car)
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
