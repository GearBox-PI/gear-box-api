import type { HttpContext } from '@adonisjs/core/http'
import Service from '#models/service'
import Client from '#models/client'
import Car from '#models/car'
import { createServiceValidator, updateServiceValidator } from '#validators/services_validator'

const ADMIN_ROLE = 'dono'
const MECHANIC_ROLE = 'mecanico'

export default class ServicesController {
  // Listar serviços (dono e mecânico)
  async index({ request, auth }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)

    const query = Service.query().orderBy('created_at', 'desc')
    if (auth.user?.tipo === MECHANIC_ROLE) {
      query.where('user_id', auth.user.id)
    }
    const services = await query.paginate(page, perPage)
    return services
  }

  // Detalhar serviço
  async show({ params, response, auth }: HttpContext) {
    const { id } = params
    const service = await Service.find(id)
    if (!service) return response.notFound({ error: 'Serviço não encontrado' })
    if (auth.user?.tipo === 'mecanico' && service.userId !== auth.user.id)
      return response.forbidden({ error: 'Sem permissão para visualizar esta ordem' })
    return service
  }

  // Criar serviço (dono e mecânico)
  async store({ auth, request, response }: HttpContext) {
    const payload = await createServiceValidator.validate(request.all())

    // Valida client/car existentes
    const client = await Client.find(payload.clientId)
    if (!client)
      return response.unprocessableEntity({
        errors: [{ field: 'clientId', message: 'Cliente inexistente' }],
      })

    const car = await Car.find(payload.carId)
    if (!car)
      return response.unprocessableEntity({
        errors: [{ field: 'carId', message: 'Carro inexistente' }],
      })

    const service = await Service.create({
      clientId: payload.clientId,
      carId: payload.carId,
      userId: auth.user?.id ?? null,
      status: payload.status ?? 'Pendente',
      description: payload.description,
      totalValue: String(payload.totalValue ?? 0),
    })

    return response.created(service)
  }

  // Atualizar serviço (dono ou mecânico para status)
  async update({ auth, params, request, response }: HttpContext) {
    const { id } = params
    const service = await Service.find(id)
    if (!service) return response.notFound({ error: 'Serviço não encontrado' })

    const data = await updateServiceValidator.validate(request.all())

    if (auth.user?.tipo === ADMIN_ROLE) {
      if (data.clientId) {
        const client = await Client.find(data.clientId)
        if (!client)
          return response.unprocessableEntity({
            errors: [{ field: 'clientId', message: 'Cliente inexistente' }],
          })
      }

      if (data.carId) {
        const car = await Car.find(data.carId)
        if (!car)
          return response.unprocessableEntity({
            errors: [{ field: 'carId', message: 'Carro inexistente' }],
          })
      }

      // totalValue é string na Model; convertemos se vier number
      if (typeof data.totalValue === 'number') {
        ;(data as any).totalValue = String(data.totalValue)
      }

      service.merge(data as any)
      await service.save()
      return service
    }

    if (auth.user?.tipo === MECHANIC_ROLE) {
      if (service.userId !== auth.user.id)
        return response.forbidden({ error: 'Sem permissão para atualizar esta ordem' })

      if (typeof data.status === 'undefined')
        return response.unprocessableEntity({
          errors: [{ field: 'status', message: 'Status é obrigatório para mecânicos' }],
        })

      service.status = data.status
      await service.save()
      return service
    }

    return response.forbidden({ error: 'Apenas donos ou mecânicos podem atualizar' })
  }

  // Remover serviço (apenas dono)
  async destroy({ auth, params, response }: HttpContext) {
    if (auth.user?.tipo !== 'dono')
      return response.forbidden({ error: 'Apenas donos podem remover' })

    const { id } = params
    const service = await Service.find(id)
    if (!service) return response.notFound({ error: 'Serviço não encontrado' })

    await service.delete()
    return response.noContent()
  }
}
