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
