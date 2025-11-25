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
