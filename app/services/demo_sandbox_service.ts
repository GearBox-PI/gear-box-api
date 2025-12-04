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

import Client from '#models/client'
import Car from '#models/car'
import User from '#models/user'
import { randomUUID } from 'node:crypto'

type DemoUserSnapshot = {
  id: string
  nome: string
  email: string
  tipo: User['tipo']
}

type DemoUserRecord = DemoUserSnapshot & {
  ativo: boolean
  createdAt: string
  updatedAt: string
}

type DemoClientRecord = {
  id: string
  nome: string
  telefone: string
  email?: string | null
  createdBy: string | null
  updatedBy: string | null
  createdAt: string
  updatedAt: string
  createdByUser?: DemoUserSnapshot | null
  updatedByUser?: DemoUserSnapshot | null
}

type DemoCarRecord = {
  id: string
  clientId: string
  placa: string
  marca: string
  modelo: string
  ano: number
  createdAt: string
  updatedAt: string
}

type BudgetStatus = 'aberto' | 'aceito' | 'recusado' | 'cancelado'

type DemoBudgetRecord = {
  id: string
  clientId: string
  carId: string
  userId: string | null
  createdById: string | null
  updatedById: string | null
  description: string
  amount: string
  status: BudgetStatus
  prazoEstimadoDias?: number | null
  createdAt: string
  updatedAt: string
  user?: DemoUserSnapshot | null
  createdBy?: DemoUserSnapshot | null
  updatedBy?: DemoUserSnapshot | null
}

type ServiceStatus = 'Pendente' | 'Em andamento' | 'Concluído' | 'Cancelado'

type DemoServiceRecord = {
  id: string
  clientId: string
  carId: string
  budgetId?: string | null
  userId?: string | null
  assignedToId?: string | null
  createdById?: string | null
  updatedById?: string | null
  status: ServiceStatus
  description?: string | null
  totalValue: string
  prazoEstimadoDias?: number | null
  dataPrevista?: string | null
  createdAt: string
  updatedAt: string
  user?: DemoUserSnapshot | null
  assignedTo?: DemoUserSnapshot | null
  createdBy?: DemoUserSnapshot | null
  updatedBy?: DemoUserSnapshot | null
  budget?: DemoBudgetRecord | null
}

type ValidationError = { field: string; message: string }

type DemoSession = {
  users: Map<string, DemoUserRecord>
  clients: Map<string, DemoClientRecord>
  cars: Map<string, DemoCarRecord>
  budgets: Map<string, DemoBudgetRecord>
  services: Map<string, DemoServiceRecord>
}

export type PaginatedResult<T> = {
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
  data: T[]
}

type ClientCarValidationResult = {
  client?: DemoClientRecord | Client
  car?: DemoCarRecord | Car
  errors: ValidationError[]
}

type ServiceListFilters = {
  search?: string
  status?: ServiceStatus
  startDate?: string | null
  endDate?: string | null
}

type BudgetListFilters = {
  search?: string
  status?: BudgetStatus
}

const BASE_PAGE = 1
const BASE_PER_PAGE = 10
const DAY_IN_MS = 24 * 60 * 60 * 1000

const DEMO_MECHANICS = [
  {
    id: '44444444-4444-4444-8444-444444444444',
    nome: 'Marcos Souza',
    email: 'marcos@demo.com',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    nome: 'Patrícia Nogueira',
    email: 'patricia@demo.com',
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    nome: 'Diego Carvalho',
    email: 'diego@demo.com',
  },
] as const

const DEMO_CLIENTS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    nome: 'João Pereira',
    telefone: '(11) 98888-0001',
    email: 'joao.pereira@cliente.com',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    nome: 'Maria Costa',
    telefone: '(21) 97777-0002',
    email: 'maria.costa@cliente.com',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    nome: 'Carlos Lima',
    telefone: '(31) 96666-0003',
    email: 'carlos.lima@cliente.com',
  },
] as const

const DEMO_CARS = [
  {
    id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    clientId: '11111111-1111-4111-8111-111111111111',
    placa: 'XYZ1A23',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: 2020,
  },
  {
    id: 'bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    clientId: '22222222-2222-4222-8222-222222222222',
    placa: 'ABC2B34',
    marca: 'Honda',
    modelo: 'Civic',
    ano: 2019,
  },
  {
    id: 'ccccccc3-cccc-4ccc-8ccc-cccccccccccc',
    clientId: '33333333-3333-4333-8333-333333333333',
    placa: 'JKL3C45',
    marca: 'Volkswagen',
    modelo: 'T-Cross',
    ano: 2021,
  },
  {
    id: 'ddddddd4-dddd-4ddd-8ddd-dddddddddddd',
    clientId: '33333333-3333-4333-8333-333333333333',
    placa: 'MNO4D56',
    marca: 'Chevrolet',
    modelo: 'Onix',
    ano: 2018,
  },
] as const

const DEMO_BUDGETS = [
  {
    id: '77777777-7777-4777-8777-777777777777',
    clientId: DEMO_CLIENTS[0].id,
    carId: DEMO_CARS[0].id,
    description: 'Revisão completa e troca de óleo',
    amount: 1850,
    status: 'aberto' as BudgetStatus,
    createdDaysAgo: 12,
    updatedDaysAgo: 10,
    prazoEstimadoDias: 3,
  },
  {
    id: '88888888-8888-4888-8888-888888888888',
    clientId: DEMO_CLIENTS[1].id,
    carId: DEMO_CARS[1].id,
    description: 'Troca de embreagem e regulagem de câmbio',
    amount: 4200,
    status: 'aceito' as BudgetStatus,
    assignedToId: DEMO_MECHANICS[0].id,
    createdDaysAgo: 30,
    updatedDaysAgo: 18,
    prazoEstimadoDias: 7,
    serviceStatus: 'Em andamento' as ServiceStatus,
  },
  {
    id: '99999999-9999-4999-8999-999999999999',
    clientId: DEMO_CLIENTS[2].id,
    carId: DEMO_CARS[2].id,
    description: 'Reparo no sistema elétrico e atualização do software',
    amount: 2750,
    status: 'aceito' as BudgetStatus,
    assignedToId: DEMO_MECHANICS[1].id,
    createdDaysAgo: 45,
    updatedDaysAgo: 25,
    prazoEstimadoDias: 5,
    serviceStatus: 'Concluído' as ServiceStatus,
  },
  {
    id: 'aaaa9999-aaaa-4aaa-8aaa-999999999999',
    clientId: DEMO_CLIENTS[2].id,
    carId: DEMO_CARS[3].id,
    description: 'Pintura do para-choque e alinhamento',
    amount: 950,
    status: 'recusado' as BudgetStatus,
    createdDaysAgo: 8,
    updatedDaysAgo: 6,
  },
  {
    id: 'bbbb1111-bbbb-4bbb-8bbb-111111111111',
    clientId: DEMO_CLIENTS[0].id,
    carId: DEMO_CARS[0].id,
    description: 'Diagnóstico da injeção eletrônica e limpeza de bicos',
    amount: 1380,
    status: 'aceito' as BudgetStatus,
    assignedToId: DEMO_MECHANICS[2].id,
    createdDaysAgo: 6,
    updatedDaysAgo: 2,
    prazoEstimadoDias: 4,
    serviceStatus: 'Pendente' as ServiceStatus,
  },
] as const

export class DemoSandboxService {
  private sessions = new Map<string, DemoSession>()

  resetForUser(userId: string) {
    this.sessions.set(userId, {
      users: new Map(),
      clients: new Map(),
      cars: new Map(),
      budgets: new Map(),
      services: new Map(),
    })
  }

  setupForUser(user: User) {
    this.resetForUser(user.id)
    this.seedDemoData(user)
  }

  clearForUser(userId: string) {
    this.sessions.delete(userId)
  }

  isDemoUser(user: User | null | undefined): user is User & { tipo: 'demo' } {
    return !!user && user.tipo === 'demo'
  }

  ensureSession(userId: string) {
    if (!this.sessions.has(userId)) {
      this.resetForUser(userId)
    }
    return this.sessions.get(userId)!
  }

  paginateArray<T>(items: T[], page = BASE_PAGE, perPage = BASE_PER_PAGE): PaginatedResult<T> {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : BASE_PAGE
    const safePerPage =
      Number.isFinite(perPage) && perPage > 0 ? Math.min(Math.floor(perPage), 200) : BASE_PER_PAGE
    const total = items.length
    const lastPage = Math.max(1, Math.ceil(total / safePerPage))
    const start = (safePage - 1) * safePerPage
    const end = start + safePerPage
    return {
      meta: {
        total,
        perPage: safePerPage,
        currentPage: safePage,
        lastPage,
      },
      data: items.slice(start, end),
    }
  }

  private seedDemoData(user: User) {
    const session = this.ensureSession(user.id)
    const ownerSnapshot = this.snapshotUser(user)
    const now = Date.now()
    const isoDaysAgo = (days: number) => new Date(now - days * DAY_IN_MS).toISOString()

    const ownerRecord: DemoUserRecord = {
      ...(ownerSnapshot ?? {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      }),
      ativo: true,
      createdAt: isoDaysAgo(60),
      updatedAt: isoDaysAgo(1),
    }
    session.users.set(ownerRecord.id, ownerRecord)

    DEMO_MECHANICS.forEach((mechanic, index) => {
      const createdAt = isoDaysAgo(55 - index * 5)
      session.users.set(mechanic.id, {
        ...mechanic,
        tipo: 'mecanico',
        ativo: true,
        createdAt,
        updatedAt: isoDaysAgo(3 - index),
      })
    })

    DEMO_CLIENTS.forEach((client, index) => {
      const createdAt = isoDaysAgo(20 - index * 2)
      const record: DemoClientRecord = {
        id: client.id,
        nome: client.nome,
        telefone: client.telefone,
        email: client.email,
        createdBy: ownerSnapshot?.id ?? null,
        updatedBy: ownerSnapshot?.id ?? null,
        createdAt,
        updatedAt: isoDaysAgo(5 - index),
        createdByUser: ownerSnapshot,
        updatedByUser: ownerSnapshot,
      }
      session.clients.set(client.id, record)
    })

    DEMO_CARS.forEach((car, index) => {
      const createdAt = isoDaysAgo(18 - index)
      session.cars.set(car.id, {
        ...car,
        createdAt,
        updatedAt: isoDaysAgo(4),
      })
    })

    DEMO_BUDGETS.forEach((budgetSeed) => {
      const createdAt = isoDaysAgo(budgetSeed.createdDaysAgo ?? 10)
      const updatedAt = isoDaysAgo(budgetSeed.updatedDaysAgo ?? budgetSeed.createdDaysAgo ?? 5)
      const assignedSnapshot =
        budgetSeed.assignedToId != null
          ? this.getUserSnapshotFromSession(session, budgetSeed.assignedToId)
          : null

      const budget: DemoBudgetRecord = {
        id: budgetSeed.id,
        clientId: budgetSeed.clientId,
        carId: budgetSeed.carId,
        userId: assignedSnapshot?.id ?? null,
        createdById: ownerSnapshot?.id ?? null,
        updatedById: ownerSnapshot?.id ?? null,
        description: budgetSeed.description,
        amount: budgetSeed.amount.toFixed(2),
        status: budgetSeed.status,
        prazoEstimadoDias: budgetSeed.prazoEstimadoDias ?? null,
        createdAt,
        updatedAt,
        user: assignedSnapshot,
        createdBy: ownerSnapshot,
        updatedBy: ownerSnapshot,
      }

      session.budgets.set(budget.id, budget)

      if (budgetSeed.status === 'aceito' && assignedSnapshot) {
        const service = this.createServiceFromBudget(session, budget, assignedSnapshot, user)
        service.status = budgetSeed.serviceStatus ?? 'Pendente'
        service.updatedAt = updatedAt
        if (budgetSeed.serviceStatus === 'Concluído') {
          service.dataPrevista = updatedAt
        }
      }
    })
  }

  listUsers(userId: string, page = BASE_PAGE, perPage = BASE_PER_PAGE, search?: string) {
    const session = this.ensureSession(userId)
    const term = search?.trim().toLowerCase()
    const users = Array.from(session.users.values()).filter((record) => {
      if (!term) return true
      return (
        record.nome.toLowerCase().includes(term) ||
        record.email.toLowerCase().includes(term) ||
        record.tipo.toLowerCase().includes(term)
      )
    })
    const sorted = users.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return this.paginateArray(sorted, page, perPage)
  }

  findUser(userId: string, targetId: string) {
    const session = this.ensureSession(userId)
    return session.users.get(targetId) ?? null
  }

  createUser(
    owner: User,
    payload: { nome: string; email: string; tipo: 'dono' | 'mecanico' | 'demo'; ativo?: boolean }
  ) {
    const session = this.ensureSession(owner.id)
    const now = new Date().toISOString()
    const record: DemoUserRecord = {
      id: randomUUID(),
      nome: payload.nome,
      email: payload.email,
      tipo: payload.tipo,
      ativo: payload.ativo ?? true,
      createdAt: now,
      updatedAt: now,
    }
    session.users.set(record.id, record)
    return record
  }

  updateUser(
    owner: User,
    targetId: string,
    data: Partial<{ nome: string; email: string; tipo: 'dono' | 'mecanico' | 'demo'; ativo: boolean }>
  ) {
    const session = this.ensureSession(owner.id)
    const record = session.users.get(targetId)
    if (!record) return null

    if (typeof data.nome !== 'undefined') record.nome = data.nome
    if (typeof data.email !== 'undefined') record.email = data.email
    if (typeof data.tipo !== 'undefined') record.tipo = data.tipo
    if (typeof data.ativo !== 'undefined') record.ativo = data.ativo

    record.updatedAt = new Date().toISOString()
    session.users.set(record.id, record)
    return record
  }

  deleteUser(owner: User, targetId: string) {
    const session = this.ensureSession(owner.id)
    return session.users.delete(targetId)
  }

  findUserByEmail(ownerId: string, email: string) {
    const session = this.ensureSession(ownerId)
    const target = email.trim().toLowerCase()
    for (const record of session.users.values()) {
      if (record.email.toLowerCase() === target) return record
    }
    return null
  }

  listClients(userId: string, search?: string) {
    const session = this.ensureSession(userId)
    const term = search?.trim().toLowerCase()
    const clients = Array.from(session.clients.values()).filter((client) => {
      if (!term) return true
      return (
        client.nome.toLowerCase().includes(term) ||
        (client.email ?? '').toLowerCase().includes(term) ||
        client.telefone.toLowerCase().includes(term) ||
        client.id.toLowerCase().includes(term)
      )
    })
    return clients.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  findClient(userId: string, clientId: string) {
    const session = this.ensureSession(userId)
    return session.clients.get(clientId)
  }

  createClient(user: User, payload: { nome: string; telefone: string; email?: string | null }) {
    const session = this.ensureSession(user.id)
    const now = new Date().toISOString()
    const userSnapshot = this.snapshotUser(user)
    const client: DemoClientRecord = {
      id: randomUUID(),
      nome: payload.nome,
      telefone: payload.telefone,
      email: payload.email ?? null,
      createdBy: user.id,
      updatedBy: user.id,
      createdAt: now,
      updatedAt: now,
      createdByUser: userSnapshot,
      updatedByUser: userSnapshot,
    }

    session.clients.set(client.id, client)
    return client
  }

  updateClient(
    user: User,
    clientId: string,
    data: Partial<{ nome: string; telefone: string; email?: string | null }>
  ) {
    const session = this.ensureSession(user.id)
    const client = session.clients.get(clientId)
    if (!client) return null

    if (typeof data.nome !== 'undefined') client.nome = data.nome
    if (typeof data.telefone !== 'undefined') client.telefone = data.telefone
    if (typeof data.email !== 'undefined') client.email = data.email ?? null

    client.updatedAt = new Date().toISOString()
    client.updatedBy = user.id
    client.updatedByUser = this.snapshotUser(user)

    return client
  }

  deleteClient(userId: string, clientId: string) {
    const session = this.ensureSession(userId)
    const deleted = session.clients.delete(clientId)
    if (!deleted) return false

    // Remove registros dependentes
    for (const [carId, car] of Array.from(session.cars.entries())) {
      if (car.clientId === clientId) {
        session.cars.delete(carId)
      }
    }

    for (const [budgetId, budget] of Array.from(session.budgets.entries())) {
      if (budget.clientId === clientId) {
        this.deleteBudget(userId, budgetId)
      }
    }

    for (const [serviceId, service] of Array.from(session.services.entries())) {
      if (service.clientId === clientId) {
        session.services.delete(serviceId)
      }
    }

    return true
  }

  listCars(userId: string, search?: string) {
    const session = this.ensureSession(userId)
    const term = search?.trim().toLowerCase()
    const cars = Array.from(session.cars.values()).filter((car) => {
      if (!term) return true
      const haystack = `${car.placa} ${car.marca} ${car.modelo} ${car.id}`.toLowerCase()
      return haystack.includes(term)
    })
    return cars.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  findCar(userId: string, carId: string) {
    const session = this.ensureSession(userId)
    return session.cars.get(carId)
  }

  async createCar(
    user: User,
    payload: { clientId: string; placa: string; marca: string; modelo: string; ano: number }
  ): Promise<{ status: 'ok'; data: DemoCarRecord } | { status: 'validation'; errors: ValidationError[] }> {
    const session = this.ensureSession(user.id)
    const clientRef = await this.resolveClient(user.id, payload.clientId)
    if (!clientRef) {
      return {
        status: 'validation',
        errors: [{ field: 'clientId', message: 'Cliente inexistente' }],
      }
    }

    const now = new Date().toISOString()
    const car: DemoCarRecord = {
      id: randomUUID(),
      clientId: payload.clientId,
      placa: payload.placa,
      marca: payload.marca,
      modelo: payload.modelo,
      ano: payload.ano,
      createdAt: now,
      updatedAt: now,
    }

    session.cars.set(car.id, car)
    return { status: 'ok', data: car }
  }

  updateCar(
    user: User,
    carId: string,
    data: Partial<{ placa: string; marca: string; modelo: string; ano: number }>
  ) {
    const session = this.ensureSession(user.id)
    const car = session.cars.get(carId)
    if (!car) return null

    if (typeof data.placa !== 'undefined') car.placa = data.placa
    if (typeof data.marca !== 'undefined') car.marca = data.marca
    if (typeof data.modelo !== 'undefined') car.modelo = data.modelo
    if (typeof data.ano !== 'undefined') car.ano = data.ano

    car.updatedAt = new Date().toISOString()
    return car
  }

  deleteCar(userId: string, carId: string) {
    const session = this.ensureSession(userId)
    const deleted = session.cars.delete(carId)
    if (!deleted) return false

    for (const [budgetId, budget] of Array.from(session.budgets.entries())) {
      if (budget.carId === carId) {
        this.deleteBudget(userId, budgetId)
      }
    }

    for (const [serviceId, service] of Array.from(session.services.entries())) {
      if (service.carId === carId) {
        session.services.delete(serviceId)
      }
    }

    return true
  }

  listBudgets(userId: string, filters: BudgetListFilters = {}) {
    const session = this.ensureSession(userId)
    const term = filters.search?.trim().toLowerCase()
    const budgets = Array.from(session.budgets.values()).filter((budget) => {
      if (filters.status && budget.status !== filters.status) return false
      if (!term) return true
      const haystack = `${budget.description} ${budget.amount} ${budget.status} ${budget.id}`.toLowerCase()
      return haystack.includes(term)
    })
    return budgets.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  findBudget(userId: string, budgetId: string) {
    const session = this.ensureSession(userId)
    return session.budgets.get(budgetId)
  }

  async createBudget(
    user: User,
    payload: {
      clientId: string
      carId: string
      description: string
      amount: number
      status?: BudgetStatus
      prazoEstimadoDias?: number | null
      assignedToId?: string | null
    }
  ): Promise<
    | { status: 'ok'; data: DemoBudgetRecord }
    | { status: 'validation'; errors: ValidationError[] }
    | { status: 'forbidden' }
  > {
    const validation = await this.validateClientAndCar(user.id, payload.clientId, payload.carId)
    if (validation.errors.length) {
      return { status: 'validation', errors: validation.errors }
    }

    const assignedUserSnapshot = payload.assignedToId
      ? await this.resolveUserSnapshot(payload.assignedToId)
      : null

    if (payload.assignedToId && !assignedUserSnapshot) {
      return {
        status: 'validation',
        errors: [{ field: 'assignedToId', message: 'Usuário responsável inválido.' }],
      }
    }

    const session = this.ensureSession(user.id)
    const now = new Date().toISOString()
    const userSnapshot = this.snapshotUser(user)
    const targetStatus = payload.status ?? 'aberto'
    const targetUser = assignedUserSnapshot ?? userSnapshot

    const budget: DemoBudgetRecord = {
      id: randomUUID(),
      clientId: payload.clientId,
      carId: payload.carId,
      userId: targetUser?.id ?? null,
      createdById: user.id,
      updatedById: user.id,
      description: payload.description,
      amount: this.amountToString(payload.amount),
      status: targetStatus,
      prazoEstimadoDias: payload.prazoEstimadoDias ?? null,
      createdAt: now,
      updatedAt: now,
      user: targetUser,
      createdBy: userSnapshot,
      updatedBy: userSnapshot,
    }

    session.budgets.set(budget.id, budget)
    return { status: 'ok', data: budget }
  }

  async updateBudget(
    user: User,
    budgetId: string,
    data: Partial<{
      clientId: string
      carId: string
      description: string
      amount: number
      status: BudgetStatus
      prazoEstimadoDias: number | null
    }>
  ) {
    const session = this.ensureSession(user.id)
    const budget = session.budgets.get(budgetId)
    if (!budget) return null

    const targetClientId = data.clientId ?? budget.clientId
    const targetCarId = data.carId ?? budget.carId
    const validation = await this.validateClientAndCar(user.id, targetClientId, targetCarId)
    if (validation.errors.length) {
      return { status: 'validation', errors: validation.errors }
    }

    if (typeof data.clientId !== 'undefined') budget.clientId = data.clientId
    if (typeof data.carId !== 'undefined') budget.carId = data.carId
    if (typeof data.description !== 'undefined') budget.description = data.description
    if (typeof data.amount === 'number') budget.amount = this.amountToString(data.amount)
    if (typeof data.status !== 'undefined') budget.status = data.status
    if (typeof data.prazoEstimadoDias !== 'undefined') {
      budget.prazoEstimadoDias = data.prazoEstimadoDias
    }

    budget.updatedAt = new Date().toISOString()
    budget.updatedById = user.id
    budget.updatedBy = this.snapshotUser(user)

    return { status: 'ok', data: budget }
  }

  deleteBudget(userId: string, budgetId: string) {
    const session = this.ensureSession(userId)
    const removed = session.budgets.delete(budgetId)
    if (!removed) return false

    for (const [serviceId, service] of Array.from(session.services.entries())) {
      if (service.budgetId === budgetId) {
        session.services.delete(serviceId)
      }
    }

    return true
  }

  async acceptBudget(
    user: User,
    budgetId: string,
    payload: { assignedToId: string }
  ): Promise<
    | { status: 'ok'; data: { budget: DemoBudgetRecord; service: DemoServiceRecord } }
    | { status: 'validation'; errors: ValidationError[] }
    | { status: 'not_found' }
  > {
    const session = this.ensureSession(user.id)
    const budget = session.budgets.get(budgetId)
    if (!budget) return { status: 'not_found' }

    if (budget.status !== 'aberto') {
      return {
        status: 'validation',
        errors: [{ field: 'status', message: 'Apenas orçamentos abertos podem ser aceitos.' }],
      }
    }

    const assignedUserSnapshot = await this.resolveUserSnapshot(payload.assignedToId)
    if (!assignedUserSnapshot) {
      return {
        status: 'validation',
        errors: [{ field: 'assignedToId', message: 'Usuário responsável inválido ou inativo.' }],
      }
    }

    budget.status = 'aceito'
    budget.updatedById = user.id
    budget.updatedBy = this.snapshotUser(user)
    budget.updatedAt = new Date().toISOString()
    budget.userId = assignedUserSnapshot.id
    budget.user = assignedUserSnapshot

    const service = this.createServiceFromBudget(session, budget, assignedUserSnapshot, user)

    return { status: 'ok', data: { budget, service } }
  }

  rejectBudget(user: User, budgetId: string) {
    const session = this.ensureSession(user.id)
    const budget = session.budgets.get(budgetId)
    if (!budget) return { status: 'not_found' as const }

    if (budget.status !== 'aberto') {
      return {
        status: 'validation' as const,
        errors: [{ field: 'status', message: 'Apenas orçamentos abertos podem ser recusados.' }],
      }
    }

    budget.status = 'recusado'
    budget.updatedById = user.id
    budget.updatedBy = this.snapshotUser(user)
    budget.updatedAt = new Date().toISOString()
    return { status: 'ok', data: budget }
  }

  listServices(userId: string, filters: ServiceListFilters = {}) {
    const session = this.ensureSession(userId)
    const term = filters.search?.trim().toLowerCase()
    const start = this.parseDate(filters.startDate)
    const end = this.parseDate(filters.endDate, true)

    const services = Array.from(session.services.values()).filter((service) => {
      if (filters.status && service.status !== filters.status) return false
      const createdAtDate = this.parseDate(service.createdAt)
      if (start && createdAtDate && createdAtDate < start) return false
      if (end && createdAtDate && createdAtDate > end) return false
      if (!term) return true
      const haystack = `${service.description ?? ''} ${service.status} ${service.id} ${
        service.totalValue
      }`.toLowerCase()
      return haystack.includes(term)
    })

    return services.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  findService(userId: string, serviceId: string) {
    const session = this.ensureSession(userId)
    return session.services.get(serviceId)
  }

  async updateService(
    user: User,
    serviceId: string,
    data: Partial<{
      clientId: string
      carId: string
      status: ServiceStatus
      description: string | null
      totalValue: number
      prazoEstimadoDias: number | null
      dataPrevista: string | null
      budgetId: string | null
    }>
  ) {
    const session = this.ensureSession(user.id)
    const service = session.services.get(serviceId)
    if (!service) return null

    const targetClientId = data.clientId ?? service.clientId
    const targetCarId = data.carId ?? service.carId
    const validation = await this.validateClientAndCar(user.id, targetClientId, targetCarId)
    if (validation.errors.length) {
      return { status: 'validation' as const, errors: validation.errors }
    }

    if (typeof data.clientId !== 'undefined') service.clientId = data.clientId
    if (typeof data.carId !== 'undefined') service.carId = data.carId
    if (typeof data.status !== 'undefined') service.status = data.status
    if (typeof data.description !== 'undefined') service.description = data.description
    if (typeof data.totalValue === 'number') service.totalValue = this.amountToString(data.totalValue)
    if (typeof data.prazoEstimadoDias !== 'undefined') {
      service.prazoEstimadoDias = data.prazoEstimadoDias
    }
    if (typeof data.dataPrevista !== 'undefined') {
      service.dataPrevista = data.dataPrevista ?? null
    }

    if (typeof data.budgetId !== 'undefined') {
      if (data.budgetId === null) {
        service.budgetId = null
        service.budget = null
      } else {
        const budget = session.budgets.get(data.budgetId)
        if (!budget) {
          return {
            status: 'validation' as const,
            errors: [{ field: 'budgetId', message: 'Orçamento inexistente para esta sessão.' }],
          }
        }
        service.budgetId = budget.id
        service.budget = budget
      }
    }

    service.updatedAt = new Date().toISOString()
    service.updatedById = user.id
    service.updatedBy = this.snapshotUser(user)

    return { status: 'ok', data: service }
  }

  deleteService(userId: string, serviceId: string) {
    const session = this.ensureSession(userId)
    return session.services.delete(serviceId)
  }

  async createStandaloneService(
    user: User,
    payload: {
      clientId: string
      carId: string
      status?: ServiceStatus
      description?: string | null
      totalValue?: number
      prazoEstimadoDias?: number | null
      dataPrevista?: string | null
      budgetId?: string | null
    }
  ): Promise<
    | { status: 'ok'; data: DemoServiceRecord }
    | { status: 'validation'; errors: ValidationError[] }
    | { status: 'not_found' }
  > {
    const validation = await this.validateClientAndCar(user.id, payload.clientId, payload.carId)
    if (validation.errors.length) {
      return { status: 'validation', errors: validation.errors }
    }

    const session = this.ensureSession(user.id)
    let attachedBudget: DemoBudgetRecord | null = null
    if (payload.budgetId) {
      attachedBudget = session.budgets.get(payload.budgetId) ?? null
      if (!attachedBudget) {
        return {
          status: 'validation',
          errors: [{ field: 'budgetId', message: 'Orçamento não pertence a esta sessão.' }],
        }
      }
      if (
        attachedBudget.clientId !== payload.clientId ||
        attachedBudget.carId !== payload.carId
      ) {
        return {
          status: 'validation',
          errors: [{ field: 'budgetId', message: 'Orçamento não corresponde ao cliente/carro.' }],
        }
      }
    }

    const now = new Date().toISOString()
    const creator = this.snapshotUser(user)
    const service: DemoServiceRecord = {
      id: randomUUID(),
      clientId: payload.clientId,
      carId: payload.carId,
      budgetId: attachedBudget?.id ?? null,
      userId: user.id,
      assignedToId: user.id,
      createdById: user.id,
      updatedById: user.id,
      status: payload.status ?? 'Pendente',
      description: payload.description ?? null,
      totalValue: this.amountToString(payload.totalValue ?? 0),
      prazoEstimadoDias: payload.prazoEstimadoDias ?? null,
      dataPrevista: payload.dataPrevista ?? null,
      createdAt: now,
      updatedAt: now,
      user: creator,
      assignedTo: creator,
      createdBy: creator,
      updatedBy: creator,
      budget: attachedBudget,
    }

    session.services.set(service.id, service)
    return { status: 'ok', data: service }
  }

  private createServiceFromBudget(
    session: DemoSession,
    budget: DemoBudgetRecord,
    assignedUser: DemoUserSnapshot,
    authUser: User
  ) {
    const now = new Date().toISOString()
    const creator = this.snapshotUser(authUser)
    const service: DemoServiceRecord = {
      id: randomUUID(),
      clientId: budget.clientId,
      carId: budget.carId,
      budgetId: budget.id,
      userId: assignedUser.id,
      assignedToId: assignedUser.id,
      createdById: authUser.id,
      updatedById: authUser.id,
      status: 'Pendente',
      description: budget.description,
      totalValue: budget.amount,
      prazoEstimadoDias: budget.prazoEstimadoDias ?? null,
      dataPrevista: null,
      createdAt: now,
      updatedAt: now,
      user: assignedUser,
      assignedTo: assignedUser,
      createdBy: creator,
      updatedBy: creator,
      budget,
    }

    session.services.set(service.id, service)
    return service
  }

  private getUserSnapshotFromSession(session: DemoSession, userId: string) {
    return this.snapshotFromRecord(session.users.get(userId))
  }

  private snapshotFromRecord(record?: DemoUserRecord | null): DemoUserSnapshot | null {
    if (!record) return null
    return {
      id: record.id,
      nome: record.nome,
      email: record.email,
      tipo: record.tipo,
    }
  }

  private snapshotUser(user: User | null | undefined): DemoUserSnapshot | null {
    if (!user) return null
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
    }
  }

  private amountToString(value: number | string) {
    if (typeof value === 'string') return value
    return value.toFixed(2)
  }

  private async resolveClient(userId: string, clientId: string) {
    const session = this.ensureSession(userId)
    const demoClient = session.clients.get(clientId)
    if (demoClient) return { source: 'session' as const, client: demoClient }

    const client = await Client.find(clientId)
    if (client) return { source: 'database' as const, client }
    return null
  }

  private async resolveCar(userId: string, carId: string) {
    const session = this.ensureSession(userId)
    const demoCar = session.cars.get(carId)
    if (demoCar) return { source: 'session' as const, car: demoCar }

    const car = await Car.find(carId)
    if (car) return { source: 'database' as const, car }
    return null
  }

  private async validateClientAndCar(userId: string, clientId: string, carId: string) {
    const errors: ValidationError[] = []
    const clientRef = await this.resolveClient(userId, clientId)
    if (!clientRef) {
      errors.push({ field: 'clientId', message: 'Cliente inexistente' })
      return { errors } as ClientCarValidationResult
    }

    const carRef = await this.resolveCar(userId, carId)
    if (!carRef) {
      errors.push({ field: 'carId', message: 'Carro inexistente' })
      return { errors } as ClientCarValidationResult
    }

    const carClientId =
      carRef.source === 'session' ? carRef.car.clientId : (carRef.car.clientId as string)

    if (carClientId !== clientId) {
      errors.push({ field: 'carId', message: 'Carro não pertence ao cliente informado' })
    }

    return {
      errors,
      client: clientRef.client,
      car: carRef.car,
    }
  }

  private async resolveUserSnapshot(userId: string) {
    const user = await User.query()
      .where('id', userId)
      .where('ativo', true)
      .whereIn('tipo', ['dono', 'mecanico', 'demo'])
      .first()
    return this.snapshotUser(user)
  }

  private parseDate(value?: string | null, endOfDay = false) {
    if (!value) return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    if (endOfDay) {
      parsed.setHours(23, 59, 59, 999)
    } else {
      parsed.setHours(0, 0, 0, 0)
    }
    return parsed
  }
}

const demoSandboxService = new DemoSandboxService()
export default demoSandboxService
