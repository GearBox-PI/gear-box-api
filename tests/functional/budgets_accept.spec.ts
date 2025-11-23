import { test } from '@japa/runner'
import User from '#models/user'

async function login(client: any, email: string, password: string) {
  const res = await client.post('/login').json({ email, password })
  res.assertStatus(200)
  return res.body().token.value
}

async function createClientAndCar(client: any, token: string) {
  const clientRes = await client
    .post('/clients')
    .header('Authorization', `Bearer ${token}`)
    .json({ nome: 'Cliente Aceite', telefone: '11999990000' })
  clientRes.assertStatus(201)
  const carRes = await client.post('/cars').header('Authorization', `Bearer ${token}`).json({
    clientId: clientRes.body().id,
    placa: 'ACM1A23',
    marca: 'Honda',
    modelo: 'Civic',
    ano: 2020,
  })
  carRes.assertStatus(201)
  return { clientId: clientRes.body().id, carId: carRes.body().id }
}

test.group('Budget acceptance flow', (group) => {
  const adminEmail = 'dono@gearbox.com'
  const mechanicEmail = 'mec@gearbox.com'
  const secondMechanicEmail = 'mec2@gearbox.com'
  const otherMechanicEmail = 'mec3@gearbox.com'
  const inactiveMechanicEmail = 'mec4@gearbox.com'

  let adminId: string
  let assignedMechanicId: string
  let inactiveMechanicId: string

  group.setup(async () => {
    const admin = await User.updateOrCreate(
      { email: adminEmail },
      { nome: 'Admin', email: adminEmail, senha: 'senha123', tipo: 'dono' }
    )
    await User.updateOrCreate(
      { email: mechanicEmail },
      { nome: 'Mec', email: mechanicEmail, senha: 'senha123', tipo: 'mecanico' }
    )
    const assignedMechanic = await User.updateOrCreate(
      { email: secondMechanicEmail },
      { nome: 'Mec2', email: secondMechanicEmail, senha: 'senha123', tipo: 'mecanico' }
    )
    await User.updateOrCreate(
      { email: otherMechanicEmail },
      { nome: 'Mec3', email: otherMechanicEmail, senha: 'senha123', tipo: 'mecanico' }
    )
    const inactiveMechanic = await User.updateOrCreate(
      { email: inactiveMechanicEmail },
      {
        nome: 'Mec4',
        email: inactiveMechanicEmail,
        senha: 'senha123',
        tipo: 'mecanico',
        ativo: false,
      }
    )

    adminId = admin.id
    assignedMechanicId = assignedMechanic.id
    inactiveMechanicId = inactiveMechanic.id
  })

  test('demands assigned user during approval', async ({ client, assert }) => {
    const ownerToken = await login(client, adminEmail, 'senha123')
    const mechToken = await login(client, mechanicEmail, 'senha123')

    const { clientId, carId } = await createClientAndCar(client, ownerToken)

    const budget = await client
      .post('/budgets')
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ clientId, carId, description: 'Alinhamento', amount: 150 })
    budget.assertStatus(201)

    const accept = await client
      .post(`/budgets/${budget.body().id}/accept`)
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({})
    accept.assertStatus(422)
    assert.equal(accept.body().errors[0].field, 'assignedToId')
  })

  test('rejects inactive assignee', async ({ client, assert }) => {
    const ownerToken = await login(client, adminEmail, 'senha123')
    const mechToken = await login(client, mechanicEmail, 'senha123')

    const { clientId, carId } = await createClientAndCar(client, ownerToken)

    const budget = await client
      .post('/budgets')
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ clientId, carId, description: 'Troca de óleo', amount: 220 })
    budget.assertStatus(201)

    const accept = await client
      .post(`/budgets/${budget.body().id}/accept`)
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ assignedToId: inactiveMechanicId })
    accept.assertStatus(422)
    assert.equal(accept.body().errors[0].field, 'assignedToId')
  })

  test('assigns service and lets the delegate view it', async ({ client, assert }) => {
    const ownerToken = await login(client, adminEmail, 'senha123')
    const mechToken = await login(client, mechanicEmail, 'senha123')
    const assignedToken = await login(client, secondMechanicEmail, 'senha123')
    const otherToken = await login(client, otherMechanicEmail, 'senha123')

    const { clientId, carId } = await createClientAndCar(client, ownerToken)

    const budget = await client
      .post('/budgets')
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ clientId, carId, description: 'Revisão completa', amount: 320 })
    budget.assertStatus(201)

    const accept = await client
      .post(`/budgets/${budget.body().id}/accept`)
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ assignedToId: assignedMechanicId })
    accept.assertStatus(200)

    const payload = accept.body()
    const serviceId = payload.service.id
    assert.equal(payload.service.assignedToId, assignedMechanicId)
    assert.equal(payload.service.createdById, adminId)
    assert.equal(payload.service.updatedById, adminId)
    assert.equal(payload.budget.id, budget.body().id)
    assert.equal(payload.budget.status, 'aceito')

    const showAsAssigned = await client
      .get(`/services/${serviceId}`)
      .header('Authorization', `Bearer ${assignedToken}`)
    showAsAssigned.assertStatus(200)

    const showAsBudgetOwner = await client
      .get(`/services/${serviceId}`)
      .header('Authorization', `Bearer ${mechToken}`)
    showAsBudgetOwner.assertStatus(200)

    const showAsOther = await client
      .get(`/services/${serviceId}`)
      .header('Authorization', `Bearer ${otherToken}`)
    showAsOther.assertStatus(403)
  })
})
