import vine from '@vinejs/vine'

const STATUS_OPTIONS = ['aberto', 'aceito', 'recusado', 'cancelado'] as const

export const createBudgetValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid(),
    carId: vine.string().uuid(),
    description: vine.string().trim().minLength(3),
    amount: vine.number().min(0),
    status: vine.enum(STATUS_OPTIONS).optional(),
  })
)

export const updateBudgetValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid().optional(),
    carId: vine.string().uuid().optional(),
    description: vine.string().trim().minLength(3).optional(),
    amount: vine.number().min(0).optional(),
    status: vine.enum(STATUS_OPTIONS).optional(),
  })
)

export type CreateBudgetInput = {
  clientId: string
  carId: string
  description: string
  amount: number
  status?: (typeof STATUS_OPTIONS)[number]
}
