import vine from '@vinejs/vine'

export const createClientValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3),
    telefone: vine.string().trim().minLength(8),
    email: vine.string().trim().email().optional(),
  })
)

export const updateClientValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).optional(),
    telefone: vine.string().trim().minLength(8).optional(),
    email: vine.string().trim().email().optional(),
  })
)

export type CreateClientInput = {
  nome: string
  telefone: string
  email?: string | null
}
