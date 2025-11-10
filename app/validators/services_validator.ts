import vine from '@vinejs/vine'

const STATUS_OPTIONS = ['Pendente', 'Em andamento', 'Concluído', 'Cancelado'] as const

export const createServiceValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid(),
    carId: vine.string().uuid(),
    status: vine.enum(STATUS_OPTIONS).optional(),
    description: vine.string().trim().minLength(3).optional(),
    totalValue: vine.number().min(0).optional(),
  })
)

export const updateServiceValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid().optional(),
    carId: vine.string().uuid().optional(),
    status: vine.enum(STATUS_OPTIONS).optional(),
    description: vine.string().trim().minLength(3).optional(),
    totalValue: vine.number().min(0).optional(),
  })
)

export type CreateServiceInput = {
  clientId: string
  carId: string
  status?: (typeof STATUS_OPTIONS)[number]
  description?: string | null
  totalValue?: number
}
