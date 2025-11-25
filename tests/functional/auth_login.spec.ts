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

// Testes de autenticação (login)
import { test } from '@japa/runner'
import User from '#models/user'

test.group('Auth / Login', (group) => {
  group.setup(async () => {
    await User.updateOrCreate(
      { email: 'dono@gearbox.com' },
      { nome: 'Admin', email: 'dono@gearbox.com', senha: 'senha123', tipo: 'dono' }
    )
  })

  test('deve autenticar com credenciais válidas', async ({ client, assert }) => {
    const response = await client.post('/login').json({
      email: 'dono@gearbox.com',
      password: 'senha123',
    })

    response.assertStatus(200)
    // Deve expor o header Authorization para conveniência
    assert.equal(response.header('authorization')?.startsWith('Bearer '), true)
    const body = response.body()
    assert.exists(body.token?.value)
    assert.notEqual(body.token.value, '[redacted]')
    assert.equal(typeof body.token.value, 'string')
    assert.equal(body.user.email, 'dono@gearbox.com')
    assert.isArray(body.token.abilities)
    assert.notInclude(body.token.abilities, '*', 'Abilities não devem conter *')
    assert.deepInclude(body.token.abilities, 'clients:read')
  })

  test('não deve autenticar com senha incorreta', async ({ client, assert }) => {
    const response = await client.post('/login').json({
      email: 'dono@gearbox.com',
      password: 'errada',
    })

    response.assertStatus(400)
    const body = response.body()
    assert.isArray(body.errors)
    assert.match(body.errors[0].message, /Invalid (user )?credentials/i)
  })

  test('deve retornar 422 se email inválido', async ({ client, assert }) => {
    const response = await client.post('/login').json({
      email: 'not-an-email',
      password: 'senha123',
    })

    response.assertStatus(422)
    const body = response.body()
    assert.isArray(body.errors)
    assert.equal(body.errors[0].field, 'email')
  })
})
