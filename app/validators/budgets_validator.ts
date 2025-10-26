import vine from '@vinejs/vine'

export const createBudgetValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid(),
    carId: vine.string().uuid(),
    status: vine.enum(['Pendente', 'Aprovado', 'Concluído'] as const).optional(),
    description: vine.string().trim().minLength(3).optional(),
    totalValue: vine.number().min(0).optional(),
  })
)

export const updateBudgetValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid().optional(),
    carId: vine.string().uuid().optional(),
    status: vine.enum(['Pendente', 'Aprovado', 'Concluído'] as const).optional(),
    description: vine.string().trim().minLength(3).optional(),
    totalValue: vine.number().min(0).optional(),
  })
)

export type CreateBudgetInput = {
  clientId: string
  carId: string
  status?: 'Pendente' | 'Aprovado' | 'Concluído'
  description?: string | null
  totalValue?: number
}
