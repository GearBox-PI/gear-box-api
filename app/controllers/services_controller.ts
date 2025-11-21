import type { HttpContext } from '@adonisjs/core/http'
import Service from '#models/service'
import Client from '#models/client'
import Car from '#models/car'
import { createServiceValidator, updateServiceValidator } from '#validators/services_validator'

const ADMIN_ROLE = 'dono'
const MECHANIC_ROLE = 'mecanico'
const VIEW_FORBIDDEN = {
  error:
    'Você não tem permissão para acessar este registro. Apenas o responsável pelo orçamento/serviço ou o dono podem visualizar este conteúdo.',
}
const EDIT_FORBIDDEN = {
  error:
    'Você não tem permissão para editar este registro. Somente o responsável pelo orçamento/serviço pode realizar alterações, ou o dono do sistema.',
}
const UPDATE_FORBIDDEN = {
  error:
    'A atualização não pode ser realizada. Este orçamento/serviço não foi criado por você. Apenas o responsável ou o dono têm permissão para modificar este item.',
}

export default class ServicesController {
  // Listar serviços (dono e mecânico)
  async index({ request, auth }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)

    const query = Service.query()
      .preload('user')
      .preload('updatedBy')
      .preload('budget', (budgetQuery) => budgetQuery.preload('user'))
      .orderBy('created_at', 'desc')

    if (auth.user?.tipo === MECHANIC_ROLE) {
      const mechanicId = auth.user.id
      query.where((builder) =>
        builder.where('user_id', mechanicId).orWhereHas('budget', (budgetQuery) => budgetQuery.where('user_id', mechanicId))
      )
    }

    const services = await query.paginate(page, perPage)
    return services
  }

  // Detalhar serviço
  async show({ params, response, auth }: HttpContext) {
    const { id } = params
    const service = await Service.query()
      .where('id', id)
      .preload('user')
      .preload('updatedBy')
      .preload('budget', (budgetQuery) => budgetQuery.preload('user'))
      .first()
    if (!service) return response.notFound({ error: 'Serviço não encontrado' })
    if (
      auth.user?.tipo === MECHANIC_ROLE &&
      service.userId !== auth.user.id &&
      service.budget?.userId !== auth.user.id
    )
      return response.forbidden(VIEW_FORBIDDEN)
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
      budgetId: null,
      updatedById: auth.user?.id ?? null,
    })

    return response.created(service)
  }

  // Atualizar serviço (dono ou mecânico para status)
  async update({ auth, params, request, response }: HttpContext) {
    const { id } = params
    const service = await Service.find(id)
    if (!service) return response.notFound({ error: 'Serviço não encontrado' })

    const userRole = auth.user?.tipo
    const isOwner = userRole === ADMIN_ROLE
    const isMechanic = userRole === MECHANIC_ROLE
    // Valida se o usuário é dono ou mecânico antes de permitir a atualização
    if (!isOwner && !isMechanic) return response.forbidden(UPDATE_FORBIDDEN)
    // O mecânico só pode atualizar serviços pelos quais é responsável
    if (isMechanic && service.userId !== auth.user?.id) return response.forbidden(EDIT_FORBIDDEN)

    const data = await updateServiceValidator.validate(request.all())

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

    if (typeof data.totalValue === 'number') {
      ;(data as any).totalValue = String(data.totalValue)
    }

    service.merge(data as any)
    service.updatedById = auth.user?.id ?? null
    await service.save()
    return service
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
