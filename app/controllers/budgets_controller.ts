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
import {
  createBudgetValidator,
  updateBudgetValidator,
  acceptBudgetValidator,
} from '#validators/budgets_validator'
import BudgetsService from '#services/budgets_service'
import { inject } from '@adonisjs/core'

const BUDGET_NOT_FOUND = { error: 'Orçamento não encontrado' }
const CREATE_FORBIDDEN = { error: 'Apenas mecânicos ou administradores podem criar orçamentos' }
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
const ACCEPT_FORBIDDEN = {
  error:
    'Você não tem permissão para atualizar o status deste orçamento. Somente o dono pode aceitar ou recusar.',
}
const MECHANIC_ROLE = 'mecanico'

@inject()
export default class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  async index({ request, auth }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Math.min(Number(request.input('perPage', 10)), 100)

    return this.budgetsService.list({ page, perPage, authUser: auth.user })
  }

  async show({ params, response, auth }: HttpContext) {
    const result = await this.budgetsService.get({ id: params.id, authUser: auth.user })
    if (result.status === 'not_found') return response.notFound(BUDGET_NOT_FOUND)
    if (result.status === 'forbidden') return response.forbidden(VIEW_FORBIDDEN)
    if (result.status === 'validation')
      return response.unprocessableEntity({ errors: result.errors })
    if (result.status !== 'ok')
      return response.internalServerError({ error: 'Falha ao localizar orçamento.' })
    return result.data
  }

  async store({ auth, request, response }: HttpContext) {
    const payload = await createBudgetValidator.validate(request.all())

    const result = await this.budgetsService.create({ ...payload, authUser: auth.user })

    if (result.status === 'forbidden') return response.forbidden(CREATE_FORBIDDEN)
    if (result.status === 'validation')
      return response.unprocessableEntity({ errors: result.errors })

    if (result.status !== 'ok')
      return response.internalServerError({ error: 'Falha ao criar orçamento.' })
    return response.created(result.data)
  }

  async update({ auth, params, request, response }: HttpContext) {
    const data = await updateBudgetValidator.validate(request.all())

    const result = await this.budgetsService.update({
      id: params.id,
      data,
      authUser: auth.user,
    })

    if (result.status === 'forbidden')
      return response.forbidden(
        auth.user?.tipo === MECHANIC_ROLE ? EDIT_FORBIDDEN : UPDATE_FORBIDDEN
      )
    if (result.status === 'not_found') return response.notFound(BUDGET_NOT_FOUND)
    if (result.status === 'validation')
      return response.unprocessableEntity({ errors: result.errors })

    if (result.status !== 'ok')
      return response.internalServerError({ error: 'Falha ao atualizar orçamento.' })
    return result.data
  }

  async destroy({ auth, params, response }: HttpContext) {
    const result = await this.budgetsService.delete({ id: params.id, authUser: auth.user })
    if (result.status === 'forbidden')
      return response.forbidden({ error: 'Apenas administradores podem remover' })
    if (result.status === 'not_found') return response.notFound(BUDGET_NOT_FOUND)
    return response.noContent()
  }

  async accept({ auth, params, request, response }: HttpContext) {
    const payload = await acceptBudgetValidator.validate(request.all())

    const result = await this.budgetsService.accept({
      id: params.id,
      assignedToId: payload.assignedToId,
      confirm: payload.confirm,
      authUser: auth.user,
    })

    if (result.status === 'not_found') return response.notFound(BUDGET_NOT_FOUND)
    if (result.status === 'forbidden') return response.forbidden(ACCEPT_FORBIDDEN)
    if (result.status === 'validation')
      return response.unprocessableEntity({ errors: result.errors })

    if (result.status !== 'ok')
      return response.internalServerError({ error: 'Falha ao aceitar orçamento.' })
    return result.data
  }

  async reject({ auth, params, response }: HttpContext) {
    const result = await this.budgetsService.reject({ id: params.id, authUser: auth.user })

    if (result.status === 'not_found') return response.notFound(BUDGET_NOT_FOUND)
    if (result.status === 'forbidden') return response.forbidden(ACCEPT_FORBIDDEN)
    if (result.status === 'validation')
      return response.unprocessableEntity({ errors: result.errors })

    if (result.status !== 'ok')
      return response.internalServerError({ error: 'Falha ao recusar orçamento.' })
    return result.data
  }
}
