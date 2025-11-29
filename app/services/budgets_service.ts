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

import Budget from '#models/budget'
import Client from '#models/client'
import Service from '#models/service'
import User from '#models/user'
import MailService, { type EmailDispatchResult } from '#services/mail_service'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import { validateClientAndCar } from '#services/relationship_guard'

type AuthUser = User | null | undefined

type ValidationError = { field: string; message: string }

type ServiceError =
  | { status: 'forbidden' }
  | { status: 'not_found' }
  | { status: 'validation'; errors: ValidationError[] }

type ServiceResult<T> = { status: 'ok'; data: T } | ServiceError

type AcceptBudgetResult = {
  budget: Budget
  service: Service
  emailNotification?: EmailDispatchResult
}

type PaginateInput = { page: number; perPage: number; authUser: AuthUser; search?: string }

type BudgetOperationInput = { id: string; authUser: AuthUser }

type CreateBudgetInput = {
  clientId: string
  carId: string
  description: string
  amount: number
  status?: 'aberto' | 'aceito' | 'recusado' | 'cancelado'
  prazoEstimadoDias?: number | null
  assignedToId?: string
  authUser: AuthUser
}

type UpdateBudgetInput = {
  id: string
  data: Partial<{
    clientId: string
    carId: string
    description: string
    amount: number
    status: 'aberto' | 'aceito' | 'recusado' | 'cancelado'
    prazoEstimadoDias: number | null
  }>
  authUser: AuthUser
}

type AcceptBudgetInput = {
  id: string
  assignedToId: string
  confirm?: boolean
  authUser: AuthUser
}

const ADMIN_ROLE = 'dono'
const MECHANIC_ROLE = 'mecanico'
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const notFound: ServiceError = { status: 'not_found' }
const forbidden: ServiceError = { status: 'forbidden' }

export default class BudgetsService {
  async list({ page, perPage, authUser, search }: PaginateInput) {
    const query = Budget.query()
      .preload('user')
      .preload('updatedBy')
      .preload('createdBy')
      .orderBy('created_at', 'desc')

    if (authUser?.tipo === MECHANIC_ROLE) {
      query.where('created_by', authUser.id)
    }

    if (search) {
      const term = `%${search}%`
      const allowIdSearch = UUID_REGEX.test(search)
      query.where((builder) => {
        builder
          .whereILike('description', term)
          .orWhereRaw('CAST(amount AS TEXT) ILIKE ?', [term])
          .orWhereILike('status', term)
        if (allowIdSearch) {
          builder.orWhere('id', search)
        }
        builder
          .orWhereHas('client', (clientQuery) => clientQuery.whereILike('nome', term))
          .orWhereHas('car', (carQuery) =>
            carQuery
              .whereILike('placa', term)
              .orWhereILike('marca', term)
              .orWhereILike('modelo', term)
          )
      })
    }

    return query.paginate(page, perPage)
  }

  async get({ id, authUser }: BudgetOperationInput): Promise<ServiceResult<Budget>> {
    const budget = await Budget.query()
      .where('id', id)
      .preload('user')
      .preload('updatedBy')
      .preload('createdBy')
      .first()

    if (!budget) return notFound
    if (authUser?.tipo === MECHANIC_ROLE && budget.createdById !== authUser.id)
      return forbidden

    return { status: 'ok', data: budget }
  }

  async create(input: CreateBudgetInput): Promise<ServiceResult<Budget>> {
    const { authUser, assignedToId, ...payload } = input
    if (!authUser || ![MECHANIC_ROLE, ADMIN_ROLE].includes(authUser.tipo)) return forbidden

    const { errors: validationErrors } = await validateClientAndCar(payload.clientId, payload.carId)
    if (validationErrors.length) return { status: 'validation', errors: validationErrors }

    const budget = await Budget.create({
      clientId: payload.clientId,
      carId: payload.carId,
      userId: payload.status === 'aceito' ? (assignedToId ?? authUser.id) : authUser.id,
      createdById: authUser.id,
      description: payload.description,
      amount: String(payload.amount),
      status: payload.status ?? 'aberto',
      updatedById: authUser.id,
      prazoEstimadoDias: payload.prazoEstimadoDias ?? null,
    })

    return { status: 'ok', data: budget }
  }

  async update(input: UpdateBudgetInput): Promise<ServiceResult<Budget>> {
    const { id, data, authUser } = input
    const isOwner = authUser?.tipo === ADMIN_ROLE
    const isMechanic = authUser?.tipo === MECHANIC_ROLE

    if (!isOwner && !isMechanic) return forbidden

    const budget = await Budget.find(id)
    if (!budget) return notFound
    if (isMechanic && budget.createdById !== authUser?.id)
      return forbidden

    if (!isOwner) {
      delete (data as any).status
    }

    const targetClientId = data.clientId ?? budget.clientId
    const targetCarId = data.carId ?? budget.carId
    const { errors: validationErrors } = await validateClientAndCar(targetClientId, targetCarId)
    if (validationErrors.length) return { status: 'validation', errors: validationErrors }

    if (typeof data.amount === 'number') {
      ;(data as any).amount = String(data.amount)
    }

    budget.merge(data as any)
    budget.updatedById = authUser?.id ?? null
    await budget.save()

    return { status: 'ok', data: budget }
  }

  async delete({ id, authUser }: BudgetOperationInput): Promise<ServiceResult<void>> {
    if (authUser?.tipo !== ADMIN_ROLE) return forbidden

    const budget = await Budget.find(id)
    if (!budget) return notFound

    await budget.delete()
    return { status: 'ok', data: undefined }
  }

  async accept(input: AcceptBudgetInput): Promise<ServiceResult<AcceptBudgetResult>> {
    const { id, assignedToId, confirm, authUser } = input
    if (!confirm) {
      return {
        status: 'validation',
        errors: [
          {
            field: 'confirm',
            message: 'Confirme a conversão do orçamento em serviço.',
          },
        ],
      }
    }
    const budget = await Budget.find(id)
    if (!budget) return notFound

    const isOwner = authUser?.tipo === ADMIN_ROLE
    const isBudgetCreator =
      authUser?.tipo === MECHANIC_ROLE && budget.createdById === authUser?.id
    if (!isOwner && !isBudgetCreator) return forbidden

    if (budget.status !== 'aberto') {
      return {
        status: 'validation',
        errors: [{ field: 'status', message: 'Apenas orçamentos abertos podem ser aceitos' }],
      }
    }

    const assignedUser = await User.query()
      .where('id', assignedToId)
      .where('ativo', true)
      .whereIn('tipo', [MECHANIC_ROLE, ADMIN_ROLE])
      .first()

    if (!assignedUser) {
      return {
        status: 'validation',
        errors: [
          {
            field: 'assignedToId',
            message: 'Escolha um usuário ativo com papel de mecânico ou dono.',
          },
        ],
      }
    }

    const trx = await db.transaction()
    try {
      budget.useTransaction(trx)
      budget.status = 'aceito'
      budget.updatedById = authUser?.id ?? null
      await budget.save()

      const prazoEstimadoDias = budget.prazoEstimadoDias ?? null
      const approvalDate = new Date()
      const dataPrevistaJs =
        prazoEstimadoDias && prazoEstimadoDias > 0
          ? new Date(approvalDate.getTime() + prazoEstimadoDias * 24 * 60 * 60 * 1000)
          : null
      const dataPrevista = dataPrevistaJs ? DateTime.fromJSDate(dataPrevistaJs) : null

      const service = await Service.create(
        {
          clientId: budget.clientId,
          carId: budget.carId,
          status: 'Pendente',
          description: budget.description,
          totalValue: budget.amount,
          userId: assignedUser.id,
          budgetId: budget.id,
          updatedById: authUser?.id ?? null,
          assignedToId: assignedUser.id,
          createdById: authUser?.id ?? null,
          prazoEstimadoDias,
          dataPrevista,
        },
        { client: trx }
      )

      await trx.commit()

      let emailNotification: EmailDispatchResult | undefined

      const customer = await Client.find(budget.clientId)
      if (!customer) {
        emailNotification = {
          status: 'skipped',
          message: 'Cliente não encontrado para envio de e-mail.',
        }
        logger.warn({ budgetId: budget.id }, emailNotification.message)
      } else {
        emailNotification = await MailService.sendServiceCreatedEmail(customer, budget, service)
      }

      return { status: 'ok', data: { budget, service, emailNotification } }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async reject({ id, authUser }: BudgetOperationInput): Promise<ServiceResult<Budget>> {
    const budget = await Budget.find(id)
    if (!budget) return notFound

    const isOwner = authUser?.tipo === ADMIN_ROLE
    const isBudgetCreator =
      authUser?.tipo === MECHANIC_ROLE && budget.createdById === authUser?.id

    if (!isOwner && !isBudgetCreator) return forbidden

    if (budget.status !== 'aberto') {
      return {
        status: 'validation',
        errors: [{ field: 'status', message: 'Apenas orçamentos abertos podem ser recusados' }],
      }
    }

    budget.status = 'recusado'
    budget.updatedById = authUser?.id ?? null
    await budget.save()
    return { status: 'ok', data: budget }
  }
}
