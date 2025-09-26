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
    'budgets:read',
    'budgets:write',
  ],
  mecanico: ['clients:read', 'cars:read', 'budgets:read', 'budgets:write'], // mecanico pode atualizar budgets mas não gerenciar clients
}

export function getAbilitiesForRole(role: string): string[] {
  return ROLE_ABILITIES[role] ?? []
}
