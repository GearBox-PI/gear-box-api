import { test } from '@japa/runner'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

async function login(client: any, email: string, password: string) {
  const res = await client.post('/login').json({ email, password })
  res.assertStatus(200)
  return res.body().token.value
}

async function seedOwnerMech() {
  const hashed = await hash.make('senha123')
  await User.updateOrCreate(
    { email: 'dono@gearbox.com' },
    { nome: 'Admin', email: 'dono@gearbox.com', senha: hashed, tipo: 'dono' }
  )
  await User.updateOrCreate(
    { email: 'mec@gearbox.com' },
    { nome: 'Mec', email: 'mec@gearbox.com', senha: hashed, tipo: 'mecanico' }
  )
}

test.group('Budgets CRUD', (group) => {
  group.setup(async () => {
    await seedOwnerMech()
  })

  test('criar/listar/mostrar/atualizar/excluir com regras de permissão', async ({
    client,
    assert,
  }) => {
    const ownerToken = await login(client, 'dono@gearbox.com', 'senha123')
    const mechToken = await login(client, 'mec@gearbox.com', 'senha123')

    // criar client e car
    const createClient = await client
      .post('/clients')
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ nome: 'Cliente Budget', telefone: '11999998888' })
    createClient.assertStatus(201)
    const clientId = createClient.body().id

    const createCar = await client
      .post('/cars')
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ clientId, placa: 'XYZ1A23', marca: 'GM', modelo: 'Onix', ano: 2021 })
    createCar.assertStatus(201)
    const carId = createCar.body().id

    // mecânico pode criar orçamento
    const createBudget = await client
      .post('/budgets')
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ clientId, carId, status: 'aberto', description: 'Troca de óleo', totalValue: 150.5 })
    createBudget.assertStatus(201)
    const budgetId = createBudget.body().id

    // listar e mostrar
    const list = await client.get('/budgets').header('Authorization', `Bearer ${ownerToken}`)
    list.assertStatus(200)
    assert.isArray(list.body().data)

    const show = await client
      .get(`/budgets/${budgetId}`)
      .header('Authorization', `Bearer ${mechToken}`)
    show.assertStatus(200)

    // atualizar (apenas dono)
    const updMech = await client
      .patch(`/budgets/${budgetId}`)
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ status: 'aprovado' })
    updMech.assertStatus(403)

    const updOwner = await client
      .patch(`/budgets/${budgetId}`)
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ status: 'aprovado' })
    updOwner.assertStatus(200)

    // excluir (apenas dono)
    const delMech = await client
      .delete(`/budgets/${budgetId}`)
      .header('Authorization', `Bearer ${mechToken}`)
    delMech.assertStatus(403)

    const delOwner = await client
      .delete(`/budgets/${budgetId}`)
      .header('Authorization', `Bearer ${ownerToken}`)
    delOwner.assertStatus(204)
  })

  test('validações: UUIDs inválidos e referências inexistentes', async ({ client }) => {
    const token = await login(client, 'dono@gearbox.com', 'senha123')

    const invalidIds = await client
      .post('/budgets')
      .header('Authorization', `Bearer ${token}`)
      .json({ clientId: 'x', carId: 'y', status: 'aberto', totalValue: 10 })
    invalidIds.assertStatus(422)

    const notFoundRefs = await client
      .post('/budgets')
      .header('Authorization', `Bearer ${token}`)
      .json({
        clientId: '00000000-0000-0000-0000-000000000000',
        carId: '00000000-0000-0000-0000-000000000000',
        status: 'aberto',
        totalValue: 10,
      })
    notFoundRefs.assertStatus(422)
  })
})
