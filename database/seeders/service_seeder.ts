import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Service from '#models/service'
import Budget from '#models/budget'
import User from '#models/user'

const START_DATE = new Date(2022, 0, 1)
const END_DATE = new Date()
const SERVICE_TARGET = 38
const CURRENT_MONTH_SERVICE_TARGET = 25

const serviceDescriptions = [
  'Troca de óleo',
  'Revisão completa',
  'Troca de pastilhas e discos',
  'Regulagem de embreagem',
  'Limpeza do sistema de arrefecimento',
  'Correção de vazamento',
  'Diagnóstico eletrônico',
  'Alinhamento e balanceamento',
  'Reparo no ar-condicionado',
  'Substituição de amortecedores',
] as const

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomServiceStatus(): 'Pendente' | 'Em andamento' | 'Concluído' {
  const roll = Math.random()
  if (roll < 0.4) return 'Pendente'
  if (roll < 0.75) return 'Em andamento'
  return 'Concluído'
}

function randomValue(min = 150, max = 1500) {
  return Number((min + Math.random() * (max - min)).toFixed(2))
}

export default class ServiceSeeder extends BaseSeeder {
  public static environment = ['development', 'testing']

  async run() {
    const budgets = await Budget.query().where('status', 'aceito')
    if (!budgets.length) return

    const users = await User.all()
    const mechanics = users.filter((user) => user.tipo === 'mecanico')
    const owner = users.find((user) => user.tipo === 'dono') ?? mechanics[0]

    const shuffledBudgets = budgets.sort(() => Math.random() - 0.5)
    const servicesToCreate = Math.min(SERVICE_TARGET, shuffledBudgets.length)

    const payload = []
    for (let index = 0; index < servicesToCreate; index++) {
      const budget = shuffledBudgets[index]
      const assignedMechanic = mechanics[index % mechanics.length] ?? owner
      const serviceStatus = randomServiceStatus()

      const createdAtJS = randomDate(
        budget.createdAt ? budget.createdAt.toJSDate() : START_DATE,
        END_DATE
      )
      const createdAt = DateTime.fromJSDate(createdAtJS)
      const updatedAt = createdAt.plus({ days: Math.floor(Math.random() * 25) })
      const dueDate = createdAt.plus({ days: Math.floor(Math.random() * 10) + 2 })

      payload.push({
        budgetId: budget.id,
        clientId: budget.clientId,
        carId: budget.carId,
        userId: budget.userId,
        assignedToId: assignedMechanic.id,
        createdById: budget.createdById ?? owner.id,
        updatedById: assignedMechanic.id,
        status: serviceStatus,
        description: randomItem(serviceDescriptions),
        totalValue: randomValue().toFixed(2),
        prazoEstimadoDias: Math.floor(Math.random() * 10) + 2,
        dataPrevista: dueDate,
        createdAt,
        updatedAt,
      })
    }

    const currentMonthStart = DateTime.local().startOf('month')
    const monthlyAcceptedBudgets = shuffledBudgets.filter((budget) => {
      const createdAt = budget.createdAt ?? DateTime.fromJSDate(START_DATE)
      return createdAt.toMillis() >= currentMonthStart.toMillis()
    })
    const monthlyPayload = []
    const monthlyCount = Math.min(CURRENT_MONTH_SERVICE_TARGET, monthlyAcceptedBudgets.length)

    for (let index = 0; index < monthlyCount; index++) {
      const budget = monthlyAcceptedBudgets[index]
      const assignedMechanic = mechanics[(index + 1) % mechanics.length] ?? owner
      const baseDate =
        budget.createdAt && budget.createdAt.toMillis() >= currentMonthStart.toMillis()
          ? budget.createdAt
          : currentMonthStart
      const createdAtJS = randomDate(baseDate.toJSDate(), END_DATE)
      const createdAt = DateTime.fromJSDate(createdAtJS)
      const updatedAt = createdAt.plus({ days: Math.floor(Math.random() * 10) })
      const dueDate = createdAt.plus({ days: Math.floor(Math.random() * 5) + 1 })
      const status = ['Pendente', 'Em andamento', 'Concluído'][index % 3] as
        | 'Pendente'
        | 'Em andamento'
        | 'Concluído'

      monthlyPayload.push({
        budgetId: budget.id,
        clientId: budget.clientId,
        carId: budget.carId,
        userId: budget.userId,
        assignedToId: assignedMechanic.id,
        createdById: budget.createdById ?? owner.id,
        updatedById: assignedMechanic.id,
        status,
        description: randomItem(serviceDescriptions),
        totalValue: randomValue(300, 2000).toFixed(2),
        prazoEstimadoDias: Math.floor(Math.random() * 8) + 1,
        dataPrevista: dueDate,
        createdAt,
        updatedAt,
      })
    }

    if (monthlyCount < CURRENT_MONTH_SERVICE_TARGET) {
      const remaining = CURRENT_MONTH_SERVICE_TARGET - monthlyCount
      const fallbackBudgets = shuffledBudgets.filter(
        (budget) => !monthlyAcceptedBudgets.includes(budget)
      )
      for (let index = 0; index < remaining && index < fallbackBudgets.length; index++) {
        const budget = fallbackBudgets[index]
        const assignedMechanic = mechanics[(index + monthlyCount + 1) % mechanics.length] ?? owner
        const createdAtJS = randomDate(currentMonthStart.toJSDate(), END_DATE)
        const createdAt = DateTime.fromJSDate(createdAtJS)
        const updatedAt = createdAt.plus({ days: Math.floor(Math.random() * 6) })
        const dueDate = createdAt.plus({ days: Math.floor(Math.random() * 4) + 1 })
        const status = ['Pendente', 'Em andamento', 'Concluído'][
          (index + monthlyCount) % 3
        ] as 'Pendente' | 'Em andamento' | 'Concluído'

        monthlyPayload.push({
          budgetId: budget.id,
          clientId: budget.clientId,
          carId: budget.carId,
          userId: budget.userId,
          assignedToId: assignedMechanic.id,
          createdById: budget.createdById ?? owner.id,
          updatedById: assignedMechanic.id,
          status,
          description: randomItem(serviceDescriptions),
          totalValue: randomValue(300, 2000).toFixed(2),
          prazoEstimadoDias: Math.floor(Math.random() * 6) + 1,
          dataPrevista: dueDate,
          createdAt,
          updatedAt,
        })
      }
    }

    await Service.createMany([...payload, ...monthlyPayload])
  }
}
