import type { HttpContext } from '@adonisjs/core/http'
import Budget from '#models/budget'
import Client from '#models/client'
import Car from '#models/car'
import Service from '#models/service'
import { createBudgetValidator, updateBudgetValidator } from '#validators/budgets_validator'
import db from '@adonisjs/lucid/services/db'

const BUDGET_NOT_FOUND = { error: 'Orçamento não encontrado' }
const CREATE_FORBIDDEN = { error: 'Apenas mecânicos ou administradores podem criar orçamentos' }
const ACCEPT_FORBIDDEN = { error: 'Apenas mecânicos ou administradores podem aceitar orçamentos' }
const ADMIN_ROLE = 'dono'
const MECHANIC_ROLE = 'mecanico'

export default class BudgetsController {
  async index({ request, auth }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)

    const query = Budget.query().orderBy('created_at', 'desc')
    if (auth.user?.tipo === MECHANIC_ROLE) {
      query.where('user_id', auth.user.id)
    }
    return query.paginate(page, perPage)
  }

  async show({ params, response, auth }: HttpContext) {
    const budget = await Budget.find(params.id)
    if (!budget) return response.notFound(BUDGET_NOT_FOUND)
    if (auth.user?.tipo === MECHANIC_ROLE && budget.userId !== auth.user.id)
      return response.forbidden({ error: 'Sem permissão para visualizar este orçamento' })
    return budget
  }

  async store({ auth, request, response }: HttpContext) {
    if (!auth.user || ![MECHANIC_ROLE, ADMIN_ROLE].includes(auth.user.tipo))
      return response.forbidden(CREATE_FORBIDDEN)

    const payload = await createBudgetValidator.validate(request.all())

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
      userId: auth.user.id,
      description: payload.description,
      amount: String(payload.amount),
      status: payload.status ?? 'aberto',
    })

    return response.created(budget)
  }

  async update({ auth, params, request, response }: HttpContext) {
    if (auth.user?.tipo !== ADMIN_ROLE)
      return response.forbidden({ error: 'Apenas administradores podem atualizar' })

    const budget = await Budget.find(params.id)
    if (!budget) return response.notFound(BUDGET_NOT_FOUND)

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

    if (typeof data.amount === 'number') {
      ;(data as any).amount = String(data.amount)
    }

    budget.merge(data as any)
    await budget.save()
    return budget
  }

  async destroy({ auth, params, response }: HttpContext) {
    if (auth.user?.tipo !== ADMIN_ROLE)
      return response.forbidden({ error: 'Apenas administradores podem remover' })

    const budget = await Budget.find(params.id)
    if (!budget) return response.notFound(BUDGET_NOT_FOUND)

    await budget.delete()
    return response.noContent()
  }

  async accept({ auth, params, response }: HttpContext) {
    if (!auth.user || ![MECHANIC_ROLE, ADMIN_ROLE].includes(auth.user.tipo))
      return response.forbidden(ACCEPT_FORBIDDEN)

    const budget = await Budget.find(params.id)
    if (!budget) return response.notFound(BUDGET_NOT_FOUND)

    if (budget.status !== 'aberto')
      return response.unprocessableEntity({
        errors: [{ field: 'status', message: 'Apenas orçamentos abertos podem ser aceitos' }],
      })

    const trx = await db.transaction()
    try {
      budget.useTransaction(trx)
      budget.status = 'aceito'
      await budget.save()

      const service = await Service.create(
        {
          clientId: budget.clientId,
          carId: budget.carId,
          status: 'Pendente',
          description: budget.description,
          totalValue: budget.amount,
          userId: auth.user.id,
        },
        { client: trx }
      )

      await trx.commit()

      return { budget, service }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async reject({ auth, params, response }: HttpContext) {
    if (!auth.user || ![MECHANIC_ROLE, ADMIN_ROLE].includes(auth.user.tipo))
      return response.forbidden(ACCEPT_FORBIDDEN)

    const budget = await Budget.find(params.id)
    if (!budget) return response.notFound(BUDGET_NOT_FOUND)

    if (budget.status !== 'aberto')
      return response.unprocessableEntity({
        errors: [{ field: 'status', message: 'Apenas orçamentos abertos podem ser recusados' }],
      })

    budget.status = 'recusado'
    await budget.save()
    return budget
  }
}
