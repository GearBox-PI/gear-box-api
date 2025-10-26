import { test } from '@japa/runner'
import User from '#models/user'

async function login(client: any, email: string, password: string) {
  const res = await client.post('/login').json({ email, password })
  res.assertStatus(200)
  return res.body().token.value as string
}

test.group('Clients CRUD', (group) => {
  group.setup(async () => {
    await User.updateOrCreate(
      { email: 'dono@gearbox.com' },
      { nome: 'Admin', email: 'dono@gearbox.com', senha: 'senha123', tipo: 'dono' }
    )
    await User.updateOrCreate(
      { email: 'mec@gearbox.com' },
      { nome: 'Mec', email: 'mec@gearbox.com', senha: 'senha123', tipo: 'mecanico' }
    )
  })

  test('mecânico e dono podem criar cliente', async ({ client, assert }) => {
    const ownerToken = await login(client, 'dono@gearbox.com', 'senha123')
    const mechToken = await login(client, 'mec@gearbox.com', 'senha123')

    const r1 = await client
      .post('/clients')
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ nome: 'Cliente 1', telefone: '11999999999', email: 'c1@ex.com' })
    r1.assertStatus(201)

    const r2 = await client
      .post('/clients')
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ nome: 'Cliente 2', telefone: '11999999998' })
    r2.assertStatus(201)
    assert.exists(r2.body().id)
  })

  test('listar exige auth', async ({ client }) => {
    const res = await client.get('/clients')
    res.assertStatus(401)
  })

  test('dono e mecânico podem listar e ver detalhe', async ({ client, assert }) => {
    const ownerToken = await login(client, 'dono@gearbox.com', 'senha123')
    const mechToken = await login(client, 'mec@gearbox.com', 'senha123')

    // cria um cliente para garantir dado
    const created = await client
      .post('/clients')
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ nome: 'Cliente List', telefone: '11911111111' })
    created.assertStatus(201)

    const list = await client.get('/clients').header('Authorization', `Bearer ${mechToken}`)
    list.assertStatus(200)
    assert.isArray(list.body().data)

    const id = list.body().data[0].id
    const show = await client.get(`/clients/${id}`).header('Authorization', `Bearer ${ownerToken}`)
    show.assertStatus(200)
    assert.equal(show.body().id, id)
  })

  test('apenas dono pode atualizar e remover', async ({ client }) => {
    const ownerToken = await login(client, 'dono@gearbox.com', 'senha123')
    const mechToken = await login(client, 'mec@gearbox.com', 'senha123')

    const created = await client
      .post('/clients')
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ nome: 'Cliente 3', telefone: '11999999997' })
    created.assertStatus(201)
    const id = created.body().id

    const updMech = await client
      .patch(`/clients/${id}`)
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ nome: 'X' })
    updMech.assertStatus(403)

    const updOwner = await client
      .patch(`/clients/${id}`)
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ nome: 'Cliente 3 Editado' })
    updOwner.assertStatus(200)

    const delMech = await client
      .delete(`/clients/${id}`)
      .header('Authorization', `Bearer ${mechToken}`)
    delMech.assertStatus(403)

    const delOwner = await client
      .delete(`/clients/${id}`)
      .header('Authorization', `Bearer ${ownerToken}`)
    delOwner.assertStatus(204)
  })

  test('validação: nome/telefone obrigatórios e email válido', async ({ client }) => {
    const ownerToken = await login(client, 'dono@gearbox.com', 'senha123')

    const res = await client
      .post('/clients')
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ nome: 'Cl', telefone: '12', email: 'inv' })
    res.assertStatus(422)
  })
})
