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
import Budget from '#models/budget'
import Car from '#models/car'
import User from '#models/user'

const START_MONTH = DateTime.local(2022, 12, 1).startOf('month')
const END_MONTH = DateTime.local(2025, 11, 1).startOf('month')
const MIN_ACCEPTED_PER_MONTH = 6
const MAX_ACCEPTED_PER_MONTH = 15
const EXTRA_NON_ACCEPTED_MAX = 4

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

function randomDateInMonth(month: DateTime) {
  const start = month.startOf('month')
  const end = month.endOf('month')
  const range = end.toMillis() - start.toMillis()
  const offset = Math.floor(Math.random() * (range + 1))
  return DateTime.fromMillis(start.toMillis() + offset)
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomAmount(min = 350, max = 5000) {
  return Number((min + Math.random() * (max - min)).toFixed(2))
}

type BudgetSeederStatus = 'aberto' | 'aceito' | 'recusado'

export default class BudgetSeeder extends BaseSeeder {
  public static environment = ['development', 'testing', 'production']

  async run() {
    const cars = await Car.query().preload('client')
    if (!cars.length) return

    const users = await User.all()
    const responsibles = users.filter((user) => ['dono', 'mecanico'].includes(user.tipo))
    const owner = users.find((user) => user.tipo === 'dono') ?? responsibles[0]

    const months: DateTime[] = []
    let cursor = END_MONTH
    while (cursor.toMillis() >= START_MONTH.toMillis()) {
      months.push(cursor)
      cursor = cursor.minus({ months: 1 })
    }

    const payload = []

    for (const month of months) {
      const acceptedCount =
        Math.floor(Math.random() * (MAX_ACCEPTED_PER_MONTH - MIN_ACCEPTED_PER_MONTH + 1)) +
        MIN_ACCEPTED_PER_MONTH
      const extraBudgets = Math.floor(Math.random() * (EXTRA_NON_ACCEPTED_MAX + 1))
      const target = acceptedCount + extraBudgets
      const statuses: BudgetSeederStatus[] = []
      for (let i = 0; i < acceptedCount; i++) statuses.push('aceito')
      for (let i = 0; i < extraBudgets; i++) {
        statuses.push(Math.random() > 0.5 ? 'aberto' : 'recusado')
      }
      statuses.sort(() => Math.random() - 0.5)

      for (let index = 0; index < target; index++) {
        const car = randomItem(cars)
        const assignedUser = randomItem(responsibles)
        const createdAt = randomDateInMonth(month)
        const updatedAt = createdAt.plus({ days: Math.floor(Math.random() * 10) + 1 })
        payload.push({
          clientId: car.clientId,
          carId: car.id,
          userId: assignedUser.id,
          createdById: Math.random() > 0.5 ? owner.id : assignedUser.id,
          updatedById: assignedUser.id,
          description: `${month.toFormat('LLL yyyy')} · ${randomItem(budgetDescriptions)}`,
          amount: randomAmount(350, 5500).toFixed(2),
          prazoEstimadoDias: Math.floor(Math.random() * 8) + 1,
          status: statuses[index],
          createdAt,
          updatedAt,
        })
      }
    }

    await Budget.createMany(payload)
  }
}
