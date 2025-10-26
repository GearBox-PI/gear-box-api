import vine from '@vinejs/vine'

export const createCarValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid(),
    placa: vine.string().trim().toUpperCase().fixedLength(7),
    marca: vine.string().trim().minLength(2),
    modelo: vine.string().trim().minLength(1),
    ano: vine
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 1),
  })
)

export const updateCarValidator = vine.compile(
  vine.object({
    placa: vine.string().trim().toUpperCase().fixedLength(7).optional(),
    marca: vine.string().trim().minLength(2).optional(),
    modelo: vine.string().trim().minLength(1).optional(),
    ano: vine
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
  })
)

export type CreateCarInput = {
  clientId: string
  placa: string
  marca: string
  modelo: string
  ano: number
}
