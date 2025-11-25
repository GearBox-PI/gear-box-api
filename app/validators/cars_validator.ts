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
