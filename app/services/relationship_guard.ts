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
import Car from '#models/car'
import Client from '#models/client'

export type ValidationError = { field: string; message: string }

export async function validateClientAndCar(
  clientId: string,
  carId: string
): Promise<{ errors: ValidationError[]; car?: Car | null }> {
  const errors: ValidationError[] = []

  const client = await Client.find(clientId)
  if (!client) {
    errors.push({ field: 'clientId', message: 'Cliente inexistente' })
    return { errors }
  }

  const car = await Car.find(carId)
  if (!car) {
    errors.push({ field: 'carId', message: 'Carro inexistente' })
    return { errors }
  }

  if (car.clientId !== clientId) {
    errors.push({ field: 'carId', message: 'Carro não pertence ao cliente informado' })
  }

  return { errors, car }
}

export async function validateBudgetLinks(
  budgetId: string,
  clientId: string,
  carId: string
): Promise<{ errors: ValidationError[]; budget?: Budget | null }> {
  const errors: ValidationError[] = []
  const budget = await Budget.find(budgetId)
  if (!budget) {
    errors.push({ field: 'budgetId', message: 'Orçamento inexistente' })
    return { errors }
  }

  if (budget.clientId !== clientId) {
    errors.push({ field: 'budgetId', message: 'Orçamento não pertence ao cliente informado' })
  }

  if (budget.carId !== carId) {
    errors.push({ field: 'budgetId', message: 'Orçamento não está associado a este carro' })
  }

  return { errors, budget }
}
