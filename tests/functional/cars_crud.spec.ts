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
  return res.body().token.value
}

async function createClient(client: any, token: string) {
  const res = await client
    .post('/clients')
    .header('Authorization', `Bearer ${token}`)
    .json({ nome: 'Cliente Car', telefone: '11912345678' })
  res.assertStatus(201)
  return res.body().id as string
}

test.group('Cars CRUD', (group) => {
  let ownerToken: string
  let mechToken: string
  let clientId: string

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

  test('fluxo completo de criação/lista/show/update/delete', async ({ client, assert }) => {
    ownerToken = await login(client, 'dono@gearbox.com', 'senha123')
    mechToken = await login(client, 'mec@gearbox.com', 'senha123')

    clientId = await createClient(client, ownerToken)

    // mecânico pode criar carro
    const createCar = await client
      .post('/cars')
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ clientId, placa: 'ABC1D23', marca: 'VW', modelo: 'Gol', ano: 2020 })
    createCar.assertStatus(201)
    const carId = createCar.body().id

    // listar autenticado
    const list = await client.get('/cars').header('Authorization', `Bearer ${ownerToken}`)
    list.assertStatus(200)
    assert.isArray(list.body().data)

    // show
    const show = await client.get(`/cars/${carId}`).header('Authorization', `Bearer ${mechToken}`)
    show.assertStatus(200)

    // update (apenas dono)
    const updMech = await client
      .patch(`/cars/${carId}`)
      .header('Authorization', `Bearer ${mechToken}`)
      .json({ marca: 'Fiat' })
    updMech.assertStatus(403)

    const updOwner = await client
      .patch(`/cars/${carId}`)
      .header('Authorization', `Bearer ${ownerToken}`)
      .json({ marca: 'Fiat' })
    updOwner.assertStatus(200)

    // delete (apenas dono)
    const delMech = await client
      .delete(`/cars/${carId}`)
      .header('Authorization', `Bearer ${mechToken}`)
    delMech.assertStatus(403)

    const delOwner = await client
      .delete(`/cars/${carId}`)
      .header('Authorization', `Bearer ${ownerToken}`)
    delOwner.assertStatus(204)
  })

  test('validação e FK: clientId inválido/placa inválida', async ({ client }) => {
    const token = await login(client, 'dono@gearbox.com', 'senha123')

    const invalidClient = await client
      .post('/cars')
      .header('Authorization', `Bearer ${token}`)
      .json({ clientId: 'not-uuid', placa: 'ABC1D23', marca: 'VW', modelo: 'Gol', ano: 2020 })
    invalidClient.assertStatus(422)

    const nonExistentClient = await client
      .post('/cars')
      .header('Authorization', `Bearer ${token}`)
      .json({
        clientId: '00000000-0000-0000-0000-000000000000',
        placa: 'ABC1D23',
        marca: 'VW',
        modelo: 'Gol',
        ano: 2020,
      })
    nonExistentClient.assertStatus(422)

    const badPlate = await client.post('/cars').header('Authorization', `Bearer ${token}`).json({
      clientId: '00000000-0000-0000-0000-000000000000',
      placa: 'AAA',
      marca: 'VW',
      modelo: 'Gol',
      ano: 2020,
    })
    badPlate.assertStatus(422)
  })
})
