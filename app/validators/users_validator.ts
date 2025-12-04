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

export const createUserValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3),
    email: vine.string().trim().email(),
    senha: vine.string().trim().minLength(6),
    tipo: vine.enum(['dono', 'mecanico', 'demo'] as const),
    ativo: vine.boolean().optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3).optional(),
    email: vine.string().trim().email().optional(),
    senha: vine.string().trim().minLength(6).optional(),
    tipo: vine.enum(['dono', 'mecanico', 'demo'] as const).optional(),
    ativo: vine.boolean().optional(),
  })
)

export type CreateUserInput = {
  nome: string
  email: string
  senha: string
  tipo: 'dono' | 'mecanico' | 'demo'
  ativo?: boolean
}
