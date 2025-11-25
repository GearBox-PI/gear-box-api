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

import { test } from '@japa/runner'
import User from '#models/user'

async function login(client: any, email: string, password: string) {
  const res = await client.post('/login').json({ email, password })
  res.assertStatus(200)
  const token = res.body().token.value
  return token
}

test.group('Auth / Logout', (group) => {
  group.setup(async () => {
    await User.updateOrCreate(
      { email: 'dono@gearbox.com' },
      { nome: 'Admin', email: 'dono@gearbox.com', senha: 'senha123', tipo: 'dono' }
    )
  })

  test('deve revogar tokens do usuário autenticado', async ({ client }) => {
    const token = await login(client, 'dono@gearbox.com', 'senha123')

    const res = await client.delete('/logout').header('Authorization', `Bearer ${token}`)
    res.assertStatus(204)

    // Tentar acessar rota autenticada deve falhar
    const res2 = await client.get('/users').header('Authorization', `Bearer ${token}`)
    res2.assertStatus(401)
  })
})
