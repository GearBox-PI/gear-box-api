import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Client from '#models/client'
import Car from '#models/car'
import Service from '#models/service'

type ClientSeed = {
  nome: string
  telefone: string
  email?: string | null
}

type CarSeed = {
  clientKey: string
  placa: string
  marca: string
  modelo: string
  ano: number
}

type ServiceSeed = {
  clientKey: string
  placa: string
  status: 'Pendente' | 'Em andamento' | 'Concluído' | 'Cancelado'
  description: string
  totalValue: number
}

export default class extends BaseSeeder {
  public async run() {
    const clientsData: ClientSeed[] = [
      {
        nome: 'João Silva',
        telefone: '(11) 98765-4321',
        email: 'joao.silva@email.com',
      },
      {
        nome: 'Maria Santos',
        telefone: '(11) 97654-3210',
        email: 'maria.santos@email.com',
      },
      {
        nome: 'Pedro Oliveira',
        telefone: '(11) 96543-2109',
        email: 'pedro.oliveira@email.com',
      },
      {
        nome: 'Ana Costa',
        telefone: '(11) 95432-1098',
        email: 'ana.costa@email.com',
      },
      {
        nome: 'Carlos Souza',
        telefone: '(11) 94321-0987',
        email: 'carlos.souza@email.com',
      },
    ]

    const clientsMap = new Map<string, Client>()

    for (const client of clientsData) {
      const identifier = client.email ? { email: client.email } : { telefone: client.telefone }
      const record = await Client.updateOrCreate(identifier, client)
      const key = client.email ?? client.telefone
      clientsMap.set(key, record)
    }

    const carsData: CarSeed[] = [
      {
        clientKey: 'joao.silva@email.com',
        placa: 'ABC1D23',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2020,
      },
      {
        clientKey: 'maria.santos@email.com',
        placa: 'DEF4G56',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2019,
      },
      {
        clientKey: 'pedro.oliveira@email.com',
        placa: 'GHI7J89',
        marca: 'Ford',
        modelo: 'Ka',
        ano: 2021,
      },
      {
        clientKey: 'ana.costa@email.com',
        placa: 'JKL0M12',
        marca: 'Volkswagen',
        modelo: 'Gol',
        ano: 2018,
      },
      {
        clientKey: 'carlos.souza@email.com',
        placa: 'MNO3P45',
        marca: 'Fiat',
        modelo: 'Uno',
        ano: 2017,
      },
      {
        clientKey: 'ana.costa@email.com',
        placa: 'PQR6S78',
        marca: 'Chevrolet',
        modelo: 'Onix',
        ano: 2022,
      },
    ]

    const carsMap = new Map<string, Car>()

    for (const car of carsData) {
      const client = clientsMap.get(car.clientKey)
      if (!client) continue

      const record = await Car.updateOrCreate(
        { placa: car.placa },
        {
          clientId: client.id,
          marca: car.marca,
          modelo: car.modelo,
          ano: car.ano,
        }
      )

      carsMap.set(car.placa, record)
    }

    const servicesData: ServiceSeed[] = [
      {
        clientKey: 'joao.silva@email.com',
        placa: 'ABC1D23',
        status: 'Em andamento',
        description: 'Troca de óleo e filtros',
        totalValue: 450,
      },
      {
        clientKey: 'maria.santos@email.com',
        placa: 'DEF4G56',
        status: 'Pendente',
        description: 'Revisão completa',
        totalValue: 1200,
      },
      {
        clientKey: 'pedro.oliveira@email.com',
        placa: 'GHI7J89',
        status: 'Concluído',
        description: 'Alinhamento e balanceamento',
        totalValue: 280,
      },
      {
        clientKey: 'ana.costa@email.com',
        placa: 'JKL0M12',
        status: 'Em andamento',
        description: 'Troca de pastilhas de freio',
        totalValue: 680,
      },
      {
        clientKey: 'carlos.souza@email.com',
        placa: 'MNO3P45',
        status: 'Pendente',
        description: 'Troca de pneus',
        totalValue: 1800,
      },
      {
        clientKey: 'ana.costa@email.com',
        placa: 'PQR6S78',
        status: 'Cancelado',
        description: 'Instalação de acessórios',
        totalValue: 900,
      },
    ]

    for (const service of servicesData) {
      const client = clientsMap.get(service.clientKey)
      const car = carsMap.get(service.placa)

      if (!client || !car) continue

      await Service.updateOrCreate(
        {
          carId: car.id,
          description: service.description,
          status: service.status,
        },
        {
          clientId: client.id,
          status: service.status,
          description: service.description,
          totalValue: service.totalValue.toFixed(2),
        }
      )
    }
  }
}
