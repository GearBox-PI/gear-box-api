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
