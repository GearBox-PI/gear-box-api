import { test } from '@japa/runner'
import User from '#models/user'

async function login(client: any, email: string, password: string) {
  const res = await client.post('/login').json({ email, password })
  res.assertStatus(200)
  return res.body().token.value
}

async function seedOwnerMech() {
  await User.updateOrCreate(
    { email: 'dono@gearbox.com' },
    { nome: 'Admin', email: 'dono@gearbox.com', senha: 'senha123', tipo: 'dono' }
  )
  await User.updateOrCreate(
    { email: 'mec@gearbox.com' },
    { nome: 'Mec', email: 'mec@gearbox.com', senha: 'senha123', tipo: 'mecanico' }
  )
}

test.group('Services CRUD', (group) => {
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
      .json({ nome: 'Cliente Serviços', telefone: '11999998888' })
    createClient.assertStatus(201)
    const clientId = createClient.body().id

    const createCar = await client
      .post('/cars')
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ clientId, placa: 'XYZ1A23', marca: 'GM', modelo: 'Onix', ano: 2021 })
    createCar.assertStatus(201)
    const carId = createCar.body().id

    // mecânico pode criar serviço
    const createService = await client
      .post('/services')
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ clientId, carId, status: 'Em andamento', description: 'Troca de óleo', totalValue: 150.5 })
    createService.assertStatus(201)
    const serviceId = createService.body().id

    // listar e mostrar
    const list = await client.get('/services').header('Authorization', `Bearer ${ownerToken}`)
    list.assertStatus(200)
    assert.isArray(list.body().data)

    const show = await client
      .get(`/services/${serviceId}`)
      .header('Authorization', `Bearer ${mechToken}`)
    show.assertStatus(200)

    // atualizar (apenas dono)
    const updMech = await client
      .patch(`/services/${serviceId}`)
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ status: 'Concluído' })
    updMech.assertStatus(403)

    const updOwner = await client
      .patch(`/services/${serviceId}`)
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ status: 'Concluído' })
    updOwner.assertStatus(200)

    // excluir (apenas dono)
    const delMech = await client
      .delete(`/services/${serviceId}`)
      .header('Authorization', `Bearer ${mechToken}`)
    delMech.assertStatus(403)

    const delOwner = await client
      .delete(`/services/${serviceId}`)
      .header('Authorization', `Bearer ${ownerToken}`)
    delOwner.assertStatus(204)
  })

  test('validações: UUIDs inválidos e referências inexistentes', async ({ client }) => {
    const token = await login(client, 'dono@gearbox.com', 'senha123')

    const invalidIds = await client
      .post('/services')
      .header('Authorization', `Bearer ${token}`)
      .json({ clientId: 'x', carId: 'y', status: 'Pendente', totalValue: 10 })
    invalidIds.assertStatus(422)

    const notFoundRefs = await client
      .post('/services')
      .header('Authorization', `Bearer ${token}`)
      .json({
        clientId: '00000000-0000-0000-0000-000000000000',
        carId: '00000000-0000-0000-0000-000000000000',
        status: 'Pendente',
        totalValue: 10,
      })
    notFoundRefs.assertStatus(422)
  })
})
