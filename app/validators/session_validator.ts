import vine from '@vinejs/vine'

/**
 * Validator para login (sessão)
 * Regras:
 * - email obrigatório, formato válido
 * - password obrigatório, mínimo 6 chars (correspondendo a coluna 'senha')
 */
export const createSessionValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(6),
  })
)

// Tipos inferidos (caso necessário em outros módulos)
export type CreateSessionInput = {
  email: string
  password: string
}
export type CreateSessionValidated = CreateSessionInput
