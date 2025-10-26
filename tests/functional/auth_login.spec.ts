// Testes de autenticação (login)
import { test } from '@japa/runner'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

test.group('Auth / Login', (group) => {
  group.setup(async () => {
    const hashed = await hash.make('senha123')
    await User.updateOrCreate(
      { email: 'dono@gearbox.com' },
      { nome: 'Admin', email: 'dono@gearbox.com', senha: hashed, tipo: 'dono' }
    )
  })

  test('deve autenticar com credenciais válidas', async ({ client, assert }) => {
    const response = await client.post('/login').json({
      email: 'dono@gearbox.com',
      password: 'senha123',
    })

    response.assertStatus(200)
    const body = response.body()
    assert.exists(body.token?.value)
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
