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

import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Service from '#models/service'
import Budget from '#models/budget'
import User from '#models/user'

const START_MONTH = DateTime.local(2022, 12, 1).startOf('month')
const END_MONTH = DateTime.local(2025, 11, 1).startOf('month')
const MIN_SERVICES_PER_MONTH = 6
const MAX_SERVICES_PER_MONTH = 15

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
]

function randomDateBetween(start: DateTime, end: DateTime) {
  const startMillis = start.toMillis()
  const endMillis = end.toMillis()
  const range = Math.max(endMillis - startMillis, 0)
  const offset = Math.floor(Math.random() * (range + 1))
  return DateTime.fromMillis(startMillis + offset)
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
  public static environment = ['development', 'testing', 'production']

  async run() {
    const budgets = await Budget.query().where('status', 'aceito').orderBy('created_at', 'asc')
    if (!budgets.length) return

    const users = await User.all()
    const mechanics = users.filter((user) => user.tipo === 'mecanico')
    const owner = users.find((user) => user.tipo === 'dono') ?? mechanics[0]
    const months: DateTime[] = []
    let cursor = END_MONTH
    while (cursor.toMillis() >= START_MONTH.toMillis()) {
      months.push(cursor)
      cursor = cursor.minus({ months: 1 })
    }

    const budgetsByMonth = new Map<string, Budget[]>()
    for (const budget of budgets) {
      const createdAt = budget.createdAt ?? START_MONTH
      const key = createdAt.toFormat('yyyy-MM')
      const existing = budgetsByMonth.get(key) ?? []
      existing.push(budget)
      budgetsByMonth.set(key, existing)
    }

    const payload = []
    for (const month of months) {
      const key = month.toFormat('yyyy-MM')
      const monthBudgets = budgetsByMonth.get(key) ?? []
      if (!monthBudgets.length) continue

      const shuffled = monthBudgets.slice().sort(() => Math.random() - 0.5)
      const maxForMonth = Math.min(MAX_SERVICES_PER_MONTH, shuffled.length)
      if (maxForMonth === 0) continue
      const minForMonth = Math.min(MIN_SERVICES_PER_MONTH, maxForMonth)
      const span = Math.max(maxForMonth - minForMonth, 0)
      const target = span > 0 ? minForMonth + Math.floor(Math.random() * (span + 1)) : minForMonth

      for (let index = 0; index < target; index++) {
        const budget = shuffled[index]
        const preferredMechanic = mechanics.find((m) => m.id === budget.userId)
        const assignedMechanic = preferredMechanic ?? mechanics[index % mechanics.length] ?? owner
        const budgetCreated = budget.createdAt ?? month
        const startRange = DateTime.max(budgetCreated.startOf('day'), month.startOf('month'))
        const endRange = month.endOf('month')
        const createdAt = randomDateBetween(startRange, endRange)
        const updatedAt = createdAt.plus({ days: Math.floor(Math.random() * 7) + 1 })
        const dueDate = createdAt.plus({ days: Math.floor(Math.random() * 5) + 1 })
        const status = randomServiceStatus()
        const parsedAmount = Number(budget.amount)

        payload.push({
          budgetId: budget.id,
          clientId: budget.clientId,
          carId: budget.carId,
          userId: assignedMechanic.id,
          assignedToId: assignedMechanic.id,
          createdById: budget.createdById ?? owner.id,
          updatedById: assignedMechanic.id,
          status,
          description: randomItem(serviceDescriptions),
          totalValue: (parsedAmount || randomValue()).toFixed(2),
          prazoEstimadoDias: budget.prazoEstimadoDias ?? Math.floor(Math.random() * 6) + 2,
          dataPrevista: dueDate,
          createdAt,
          updatedAt,
        })
      }
    }

    await Service.createMany(payload)
  }
}
