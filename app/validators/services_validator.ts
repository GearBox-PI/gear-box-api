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

const STATUS_OPTIONS = ['Pendente', 'Em andamento', 'Concluído', 'Cancelado'] as const

export const createServiceValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid(),
    carId: vine.string().uuid(),
    budgetId: vine.string().uuid(),
    status: vine.enum(STATUS_OPTIONS).optional(),
    description: vine.string().trim().minLength(3).optional(),
    totalValue: vine.number().min(0).optional(),
    prazoEstimadoDias: vine.number().min(0).optional(),
    dataPrevista: vine
      .string()
      .optional()
      .transform((value) => (value && value.trim() ? value.trim() : undefined)),
  })
)

export const updateServiceValidator = vine.compile(
  vine.object({
    clientId: vine.string().uuid().optional(),
    carId: vine.string().uuid().optional(),
    budgetId: vine.string().uuid().optional(),
    status: vine.enum(STATUS_OPTIONS).optional(),
    description: vine.string().trim().minLength(3).optional(),
    totalValue: vine.number().min(0).optional(),
    prazoEstimadoDias: vine.number().min(0).optional(),
    dataPrevista: vine.string().optional(),
  })
)

export type CreateServiceInput = {
  clientId: string
  carId: string
  budgetId: string
  status?: (typeof STATUS_OPTIONS)[number]
  description?: string | null
  totalValue?: number
}
