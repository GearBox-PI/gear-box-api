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
