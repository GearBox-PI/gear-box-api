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

import Service from '#models/service'
import User from '#models/user'
import { DateTime } from 'luxon'
import { validateBudgetLinks, validateClientAndCar } from '#services/relationship_guard'

type AuthUser = User | null | undefined

type ValidationError = { field: string; message: string }

type ServiceError =
  | { status: 'forbidden' }
  | { status: 'not_found' }
  | { status: 'validation'; errors: ValidationError[] }

type ServiceResult<T> = { status: 'ok'; data: T } | ServiceError

type DateInput = string | Date | DateTime | null | undefined

type PaginateInput = {
  page: number
  perPage: number
  authUser: AuthUser
  startDate?: DateInput
  endDate?: DateInput
}

type ServiceOperationInput = { id: string; authUser: AuthUser }

type CreateServiceInput = {
  clientId: string
  carId: string
  budgetId: string
  status?: 'Pendente' | 'Em andamento' | 'Concluído' | 'Cancelado'
  description?: string | null
  totalValue?: number
  prazoEstimadoDias?: number | null
  dataPrevista?: string | null
  authUser: AuthUser
}

type UpdateServiceInput = {
  id: string
  data: Partial<{
    clientId: string
    carId: string
    status: 'Pendente' | 'Em andamento' | 'Concluído' | 'Cancelado'
    description: string | null
    totalValue: number
    prazoEstimadoDias: number | null
    dataPrevista: string | null
    budgetId: string
  }>
  authUser: AuthUser
}

const ADMIN_ROLE = 'dono'
const MECHANIC_ROLE = 'mecanico'
const notFound: ServiceError = { status: 'not_found' }
const forbidden: ServiceError = { status: 'forbidden' }

function parseToDateTime(value: unknown) {
  if (!value) return null
  if (value instanceof DateTime) {
    return value.isValid ? value : null
  }
  if (value instanceof Date) {
    const dt = DateTime.fromJSDate(value)
    return dt.isValid ? dt : null
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const dt = DateTime.fromISO(trimmed)
    return dt.isValid ? dt : null
  }
  return null
}

export default class ServicesService {
  async list({ page, perPage, authUser, startDate, endDate }: PaginateInput) {
    const query = Service.query().preload('user').preload('updatedBy')
    query.preload('budget' as any, (budgetQuery: any) => budgetQuery.preload('user'))
    query.orderBy('created_at', 'desc')

    if (authUser?.tipo === MECHANIC_ROLE) {
      query.where('created_by', authUser.id)
    }

    const parsedStart = parseToDateTime(startDate)
    if (parsedStart) {
      query.where('created_at', '>=', parsedStart.startOf('day').toSQL())
    }

    const parsedEnd = parseToDateTime(endDate)
    if (parsedEnd) {
      query.where('created_at', '<=', parsedEnd.endOf('day').toSQL())
    }

    return query.paginate(page, perPage)
  }

  async get({ id, authUser }: ServiceOperationInput): Promise<ServiceResult<Service>> {
    const serviceQuery = Service.query().where('id', id).preload('user').preload('updatedBy')
    serviceQuery.preload('budget' as any, (budgetQuery: any) => budgetQuery.preload('user'))
    const service = await serviceQuery.first()

    if (!service) return notFound

    if (authUser?.tipo === MECHANIC_ROLE && service.createdById !== authUser.id)
      return forbidden

    return { status: 'ok', data: service }
  }

  async create(input: CreateServiceInput): Promise<ServiceResult<Service>> {
    const { authUser, ...payload } = input

    const validationErrors: ValidationError[] = []
    const { errors: clientCarErrors } = await validateClientAndCar(payload.clientId, payload.carId)
    validationErrors.push(...clientCarErrors)

    if (payload.budgetId) {
      const { errors: budgetErrors } = await validateBudgetLinks(
        payload.budgetId,
        payload.clientId,
        payload.carId
      )
      validationErrors.push(...budgetErrors)
    }

    if (validationErrors.length) return { status: 'validation', errors: validationErrors }

    const service = await Service.create({
      clientId: payload.clientId,
      carId: payload.carId,
      userId: authUser?.id ?? null,
      status: payload.status ?? 'Pendente',
      description: payload.description,
      totalValue: String(payload.totalValue ?? 0),
      budgetId: payload.budgetId,
      updatedById: authUser?.id ?? null,
      assignedToId: authUser?.id ?? null,
      createdById: authUser?.id ?? null,
      prazoEstimadoDias: payload.prazoEstimadoDias ?? null,
      dataPrevista: parseToDateTime(payload.dataPrevista),
    })

    return { status: 'ok', data: service }
  }

  async update(input: UpdateServiceInput): Promise<ServiceResult<Service>> {
    const { id, data, authUser } = input
    const userRole = authUser?.tipo
    const isOwner = userRole === ADMIN_ROLE
    const isMechanic = userRole === MECHANIC_ROLE

    if (!isOwner && !isMechanic) return forbidden

    const service = await Service.query()
      .where('id', id)
      .preload('budget' as any)
      .first()
    if (!service) return notFound

    if (isMechanic && service.createdById !== authUser?.id)
      return forbidden

    const validationErrors: ValidationError[] = []
    const targetClientId = data.clientId ?? service.clientId
    const targetCarId = data.carId ?? service.carId

    const { errors: clientCarErrors } = await validateClientAndCar(targetClientId, targetCarId)
    validationErrors.push(...clientCarErrors)

    const targetBudgetId = data.budgetId ?? service.budgetId ?? undefined
    if (targetBudgetId) {
      const { errors: budgetErrors } = await validateBudgetLinks(
        targetBudgetId,
        targetClientId,
        targetCarId
      )
      validationErrors.push(...budgetErrors)
    }

    if (validationErrors.length) return { status: 'validation', errors: validationErrors }

    if (typeof data.totalValue === 'number') {
      ;(data as any).totalValue = String(data.totalValue)
    }

    const mappedData = { ...data } as any
    mappedData.dataPrevista = parseToDateTime(data.dataPrevista)

    service.merge(mappedData)
    service.updatedById = authUser?.id ?? null
    await service.save()

    return { status: 'ok', data: service }
  }

  async delete({ id, authUser }: ServiceOperationInput): Promise<ServiceResult<void>> {
    if (authUser?.tipo !== ADMIN_ROLE) return forbidden

    const service = await Service.find(id)
    if (!service) return notFound

    await service.delete()
    return { status: 'ok', data: undefined }
  }
}
