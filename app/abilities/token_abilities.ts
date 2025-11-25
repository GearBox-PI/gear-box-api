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

/**
 * Matriz simples de abilities por tipo de usuário.
 * Expandir conforme novos recursos forem adicionados.
 */
export const ROLE_ABILITIES: Record<string, string[]> = {
  dono: [
    'clients:read',
    'clients:write',
    'cars:read',
    'cars:write',
    'services:read',
    'services:write',
  ],
  mecanico: ['clients:read', 'cars:read', 'services:read', 'services:write'], // mecanico pode atualizar serviços mas não gerenciar clients
}

export function getAbilitiesForRole(role: string): string[] {
  return ROLE_ABILITIES[role] ?? []
}
