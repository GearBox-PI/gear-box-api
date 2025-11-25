import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import User from '#models/user'
import Client from '#models/client'
import Car from '#models/car'

const START_DATE = new Date(2022, 0, 1)
const END_DATE = new Date()

const clientSeeds = [
  { nome: 'Carlos Souza', telefone: '(11) 98888-1001', email: 'carlos.souza@example.com' },
  { nome: 'Amanda Lima', telefone: '(11) 98888-1002', email: 'amanda.lima@example.com' },
  { nome: 'Renata Carvalho', telefone: '(11) 98888-1003', email: 'renata.carvalho@example.com' },
  { nome: 'João Vitor', telefone: '(11) 98888-1004', email: 'joao.vitor@example.com' },
  { nome: 'Marina Silva', telefone: '(11) 98888-1005', email: 'marina.silva@example.com' },
  { nome: 'Pedro Henrique', telefone: '(11) 98888-1006', email: 'pedro.henrique@example.com' },
  { nome: 'Fernanda Rocha', telefone: '(11) 98888-1007', email: 'fernanda.rocha@example.com' },
  { nome: 'Diego Sato', telefone: '(11) 98888-1008', email: 'diego.sato@example.com' },
  { nome: 'Patrícia Prado', telefone: '(11) 98888-1009', email: 'patricia.prado@example.com' },
  { nome: 'Lucas Martins', telefone: '(11) 98888-1010', email: 'lucas.martins@example.com' },
  { nome: 'Gabriel Reis', telefone: '(11) 98888-1011', email: 'gabriel.reis@example.com' },
  { nome: 'Paula Bernardes', telefone: '(11) 98888-1012', email: 'paula.bernardes@example.com' },
]

const vehicleSeeds = [
  { marca: 'Toyota', modelo: 'Corolla', ano: 2019 },
  { marca: 'Honda', modelo: 'Civic', ano: 2018 },
  { marca: 'Ford', modelo: 'Ranger', ano: 2020 },
  { marca: 'Chevrolet', modelo: 'Onix', ano: 2021 },
  { marca: 'Volkswagen', modelo: 'T-Cross', ano: 2022 },
  { marca: 'Fiat', modelo: 'Toro', ano: 2019 },
  { marca: 'Hyundai', modelo: 'Creta', ano: 2021 },
  { marca: 'Renault', modelo: 'Duster', ano: 2017 },
  { marca: 'Nissan', modelo: 'Kicks', ano: 2020 },
  { marca: 'Peugeot', modelo: '2008', ano: 2018 },
  { marca: 'Jeep', modelo: 'Compass', ano: 2022 },
  { marca: 'Mitsubishi', modelo: 'L200', ano: 2019 },
  { marca: 'Toyota', modelo: 'Hilux', ano: 2017 },
  { marca: 'Honda', modelo: 'HR-V', ano: 2020 },
  { marca: 'Chevrolet', modelo: 'Tracker', ano: 2021 },
]

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomPlate(index: number) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const part = `${letters[(index * 7) % 26]}${letters[(index * 3 + 5) % 26]}${letters[(index * 11 + 2) % 26]}`
  const numbers = String(1000 + ((index * 53) % 9000))
  return `${part}-${numbers}`
}

export default class VehicleSeeder extends BaseSeeder {
  public static environment = ['development', 'testing']

  async run() {
    const users = await User.all()
    const userIds = users.map((user) => user.id)

    const clients = []
    for (const data of clientSeeds) {
      const auditUser = randomItem(userIds)
      const createdAt = DateTime.fromJSDate(randomDate(START_DATE, END_DATE))
      const updatedAt = createdAt.plus({ days: Math.floor(Math.random() * 120) })
      const client = await Client.updateOrCreate(
        { email: data.email },
        {
          nome: data.nome,
          telefone: data.telefone,
          email: data.email,
          createdBy: auditUser,
          updatedBy: auditUser,
          createdAt,
          updatedAt,
        }
      )
      clients.push(client)
    }

    const carsPayload = vehicleSeeds.map((vehicle, index) => {
      const client = clients[index % clients.length]
      const createdAt = DateTime.fromJSDate(randomDate(START_DATE, END_DATE))
      return {
        clientId: client.id,
        placa: randomPlate(index + 1),
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        ano: vehicle.ano,
        createdAt,
        updatedAt: createdAt.plus({ days: Math.floor(Math.random() * 90) }),
      }
    })

    await Car.updateOrCreateMany('placa', carsPayload)
  }
}
