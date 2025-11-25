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

const STATUS_OPTIONS = ['aberto', 'aceito', 'recusado', 'cancelado'] as const

export const createBudgetValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid(),
    carId: vine.string().uuid(),
    description: vine.string().trim().minLength(3),
    amount: vine.number().min(0),
    status: vine.enum(STATUS_OPTIONS).optional(),
    prazoEstimadoDias: vine.number().min(0).optional(),
    assignedToId: vine.string().uuid().optional(),
  })
)

export const updateBudgetValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid().optional(),
    carId: vine.string().uuid().optional(),
    description: vine.string().trim().minLength(3).optional(),
    amount: vine.number().min(0).optional(),
    status: vine.enum(STATUS_OPTIONS).optional(),
    prazoEstimadoDias: vine.number().min(0).optional(),
  })
)

export const acceptBudgetValidator = vine.compile(
  vine.object({
    assignedToId: vine.string().uuid(),
    confirm: vine.boolean(),
  })
)

export type CreateBudgetInput = {
  clientId: string
  carId: string
  description: string
  amount: number
  status?: (typeof STATUS_OPTIONS)[number]
  assignedToId?: string
}
