import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3),
    email: vine.string().trim().email(),
    senha: vine.string().trim().minLength(6),
    tipo: vine.enum(['dono', 'mecanico'] as const),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).optional(),
    email: vine.string().trim().email().optional(),
    senha: vine.string().trim().minLength(6).optional(),
    tipo: vine.enum(['dono', 'mecanico'] as const).optional(),
  })
)

export type CreateUserInput = {
  nome: string
  email: string
  senha: string
  tipo: 'dono' | 'mecanico'
}
