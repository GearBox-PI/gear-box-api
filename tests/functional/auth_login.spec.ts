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
    const response = await client.post('/sessions').json({
      email: 'dono@gearbox.com',
      password: 'senha123',
    })

    response.assertStatus(200)
    const body = response.body()
    assert.exists(body.token?.value)
    assert.equal(body.user.email, 'dono@gearbox.com')
  })

  test('não deve autenticar com senha incorreta', async ({ client, assert }) => {
    const response = await client.post('/sessions').json({
      email: 'dono@gearbox.com',
      password: 'errada',
    })

    response.assertStatus(400)
    const body = response.body()
    assert.isArray(body.errors)
    // A mensagem real retornada é 'Invalid user credentials'. Tornamos o teste flexível.
    assert.match(body.errors[0].message, /Invalid (user )?credentials/i)
  })
})
