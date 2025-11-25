import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Budget from '#models/budget'
import Car from '#models/car'
import User from '#models/user'

const START_DATE = new Date(2022, 0, 1)
const END_DATE = new Date()
const CURRENT_MONTH_START = DateTime.local().startOf('month')
const BUDGET_COUNT = 60
const CURRENT_MONTH_BUDGETS = 25

const budgetDescriptions = [
  'Troca de óleo e filtros',
  'Revisão completa',
  'Alinhamento e balanceamento',
  'Problema no ar-condicionado',
  'Freios fazendo ruído',
  'Luz do motor acesa',
  'Diagnóstico de suspensão',
  'Troca de pastilhas dianteiras',
  'Reparo na caixa de direção',
  'Troca de bomba d’água',
  'Substituição de embreagem',
  'Instalação de acessórios elétricos',
]

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomAmount(min = 350, max = 5000) {
  return Number((min + Math.random() * (max - min)).toFixed(2))
}

function randomStatus(): 'aberto' | 'aceito' | 'recusado' {
  const roll = Math.random()
  if (roll < 0.5) return 'aceito'
  if (roll < 0.8) return 'aberto'
  return 'recusado'
}

export default class BudgetSeeder extends BaseSeeder {
  public static environment = ['development', 'testing']

  async run() {
    const cars = await Car.query().preload('client')
    if (!cars.length) return

    const users = await User.all()
    const responsibles = users.filter((user) => ['dono', 'mecanico'].includes(user.tipo))
    const owner = users.find((user) => user.tipo === 'dono') ?? responsibles[0]

    const payload = []
    for (let index = 0; index < BUDGET_COUNT; index++) {
      const car = randomItem(cars)
      const assignedUser = randomItem(responsibles)
      const status = randomStatus()
      const createdAtJS = randomDate(START_DATE, END_DATE)
      const createdAt = DateTime.fromJSDate(createdAtJS)
      const updatedAt = createdAt.plus({ days: Math.floor(Math.random() * 40) })
      payload.push({
        clientId: car.clientId,
        carId: car.id,
        userId: assignedUser.id,
        createdById: Math.random() > 0.7 ? owner.id : assignedUser.id,
        updatedById: assignedUser.id,
        description: randomItem(budgetDescriptions),
        amount: randomAmount().toFixed(2),
        prazoEstimadoDias: Math.floor(Math.random() * 10) + 3,
        status,
        createdAt,
        updatedAt,
      })
    }

    const currentMonthPayload = []
    for (let index = 0; index < CURRENT_MONTH_BUDGETS; index++) {
      const car = randomItem(cars)
      const assignedUser = randomItem(responsibles)
      const status: 'aberto' | 'aceito' | 'recusado' =
        index < 18 ? 'aceito' : index < 23 ? 'aberto' : 'recusado'
      const createdAtJS = randomDate(CURRENT_MONTH_START.toJSDate(), END_DATE)
      const createdAt = DateTime.fromJSDate(createdAtJS)
      const updatedAt = createdAt.plus({ days: Math.floor(Math.random() * 15) })
      currentMonthPayload.push({
        clientId: car.clientId,
        carId: car.id,
        userId: assignedUser.id,
        createdById: Math.random() > 0.5 ? owner.id : assignedUser.id,
        updatedById: assignedUser.id,
        description: `(${createdAt.toFormat('LLL')}) ${randomItem(budgetDescriptions)}`,
        amount: randomAmount(450, 6500).toFixed(2),
        prazoEstimadoDias: Math.floor(Math.random() * 7) + 1,
        status,
        createdAt,
        updatedAt,
      })
    }

    await Budget.createMany([...payload, ...currentMonthPayload])
  }
}
