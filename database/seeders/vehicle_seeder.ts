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
  { nome: 'Fabiana Torres', telefone: '(11) 98888-1013', email: 'fabiana.torres@example.com' },
  { nome: 'Eduardo Aquino', telefone: '(11) 98888-1014', email: 'eduardo.aquino@example.com' },
  { nome: 'Silvia Mendes', telefone: '(11) 98888-1015', email: 'silvia.mendes@example.com' },
  { nome: 'Flávio Castro', telefone: '(11) 98888-1016', email: 'flavio.castro@example.com' },
  { nome: 'Rafaela Leite', telefone: '(11) 98888-1017', email: 'rafaela.leite@example.com' },
  { nome: 'Adriana Monteiro', telefone: '(11) 98888-1018', email: 'adriana.monteiro@example.com' },
  { nome: 'Vinícius Prado', telefone: '(11) 98888-1019', email: 'vinicius.prado@example.com' },
  { nome: 'Letícia Farias', telefone: '(11) 98888-1020', email: 'leticia.farias@example.com' },
  { nome: 'Cláudia Fonseca', telefone: '(11) 98888-1021', email: 'claudia.fonseca@example.com' },
  { nome: 'Fábio Nunes', telefone: '(11) 98888-1022', email: 'fabio.nunes@example.com' },
  { nome: 'Roberta Lessa', telefone: '(11) 98888-1023', email: 'roberta.lessa@example.com' },
  { nome: 'Thiago Batista', telefone: '(11) 98888-1024', email: 'thiago.batista@example.com' },
  { nome: 'Aline Santana', telefone: '(11) 98888-1025', email: 'aline.santana@example.com' },
  { nome: 'Juliana Pires', telefone: '(11) 98888-1026', email: 'juliana.pires@example.com' },
  { nome: 'Caio Duarte', telefone: '(11) 98888-1027', email: 'caio.duarte@example.com' },
  { nome: 'Lorena Dias', telefone: '(11) 98888-1028', email: 'lorena.dias@example.com' },
  { nome: 'Ricardo Campos', telefone: '(11) 98888-1029', email: 'ricardo.campos@example.com' },
  { nome: 'Elisa Gonzaga', telefone: '(11) 98888-1030', email: 'elisa.gonzaga@example.com' },
  { nome: 'Marcelo Teixeira', telefone: '(11) 98888-1031', email: 'marcelo.teixeira@example.com' },
  { nome: 'Bruna Rocha', telefone: '(11) 98888-1032', email: 'bruna.rocha@example.com' },
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
  { marca: 'Ford', modelo: 'Ka Sedan', ano: 2018 },
  { marca: 'Volkswagen', modelo: 'Saveiro', ano: 2019 },
  { marca: 'Fiat', modelo: 'Argo', ano: 2021 },
  { marca: 'Hyundai', modelo: 'HB20S', ano: 2020 },
  { marca: 'Renault', modelo: 'Sandero', ano: 2017 },
  { marca: 'Nissan', modelo: 'Versa', ano: 2019 },
  { marca: 'Peugeot', modelo: '208', ano: 2022 },
  { marca: 'Jeep', modelo: 'Renegade', ano: 2021 },
  { marca: 'Mitsubishi', modelo: 'ASX', ano: 2018 },
  { marca: 'Toyota', modelo: 'Yaris', ano: 2020 },
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

    const clients: Client[] = []
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
