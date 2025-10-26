import type { HttpContext } from '@adonisjs/core/http'
import Budget from '#models/budget'
import Client from '#models/client'
import Car from '#models/car'
import { createBudgetValidator, updateBudgetValidator } from '#validators/budgets_validator'

export default class BudgetsController {
  // Listar budgets (dono e mecânico)
  async index({ request }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)

    const budgets = await Budget.query().orderBy('created_at', 'desc').paginate(page, perPage)
    return budgets
  }

  // Detalhar budget
  async show({ params, response }: HttpContext) {
    const { id } = params
    const budget = await Budget.find(id)
    if (!budget) return response.notFound({ error: 'Orçamento não encontrado' })
    return budget
  }

  // Criar budget (dono e mecânico)
  async store({ request, response }: HttpContext) {
    const payload = await createBudgetValidator.validate(request.all())

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

    const budget = await Budget.create({
      clientId: payload.clientId,
      carId: payload.carId,
      status: payload.status ?? 'Pendente',
      description: payload.description,
      totalValue: String(payload.totalValue ?? 0),
    })

    return response.created(budget)
  }

  // Atualizar budget (apenas dono)
  async update({ auth, params, request, response }: HttpContext) {
    if (auth.user?.tipo !== 'dono')
      return response.forbidden({ error: 'Apenas donos podem atualizar' })

    const { id } = params
    const budget = await Budget.find(id)
    if (!budget) return response.notFound({ error: 'Orçamento não encontrado' })

    const data = await updateBudgetValidator.validate(request.all())

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

    budget.merge(data as any)
    await budget.save()
    return budget
  }

  // Remover budget (apenas dono)
  async destroy({ auth, params, response }: HttpContext) {
    if (auth.user?.tipo !== 'dono')
      return response.forbidden({ error: 'Apenas donos podem remover' })

    const { id } = params
    const budget = await Budget.find(id)
    if (!budget) return response.notFound({ error: 'Orçamento não encontrado' })

    await budget.delete()
    return response.noContent()
  }
}
