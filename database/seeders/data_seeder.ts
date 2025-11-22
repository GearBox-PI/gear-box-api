import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Client from '#models/client'
import Car from '#models/car'
import Service from '#models/service'
import Budget from '#models/budget'
import User from '#models/user'
import { DateTime } from 'luxon'

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
  userEmail?: string
  prazoEstimadoDias?: number
  dataPrevistaOffsetDays?: number
}

type BudgetSeed = {
  clientKey: string
  placa: string
  userEmail: string
  status: 'aberto' | 'aceito' | 'recusado' | 'cancelado'
  description: string
  amount: number
  prazoEstimadoDias?: number
}

export default class extends BaseSeeder {
  public async run() {
    const users = await User.all()
    const usersMap = new Map(users.map((user) => [user.email, user]))
    const defaultMechanic =
      users.find((user) => user.tipo === 'mecanico') ??
      users.find((user) => user.tipo === 'dono') ??
      users[0] ??
      null

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
      let shouldSave = false

      if (!record.createdBy && defaultMechanic) {
        record.createdBy = defaultMechanic.id
        shouldSave = true
      }

      if (shouldSave) {
        await record.save()
      }

      clientsMap.set(key, record)
    }

    const carsData: CarSeed[] = [
      {
        clientKey: 'joao.silva@email.com',
        placa: 'ZXA1B23',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2020,
      },
      {
        clientKey: 'maria.santos@email.com',
        placa: 'ZXB4C56',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2019,
      },
      {
        clientKey: 'pedro.oliveira@email.com',
        placa: 'ZXC7D89',
        marca: 'Ford',
        modelo: 'Ka',
        ano: 2021,
      },
      {
        clientKey: 'ana.costa@email.com',
        placa: 'ZXD0E12',
        marca: 'Volkswagen',
        modelo: 'Gol',
        ano: 2018,
      },
      {
        clientKey: 'carlos.souza@email.com',
        placa: 'ZXE3F45',
        marca: 'Fiat',
        modelo: 'Uno',
        ano: 2017,
      },
      {
        clientKey: 'ana.costa@email.com',
        placa: 'ZXF6G78',
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

    const budgetsData: BudgetSeed[] = [
      {
        clientKey: 'joao.silva@email.com',
        placa: 'ZXA1B23',
        userEmail: 'mec1@gearbox.com',
        status: 'aberto',
        description: 'Diagnóstico completo do motor',
        amount: 750,
        prazoEstimadoDias: 5,
      },
      {
        clientKey: 'maria.santos@email.com',
        placa: 'ZXB4C56',
        userEmail: 'mec2@gearbox.com',
        status: 'aceito',
        description: 'Reparo no sistema de suspensão',
        amount: 1580,
        prazoEstimadoDias: 10,
      },
      {
        clientKey: 'pedro.oliveira@email.com',
        placa: 'ZXC7D89',
        userEmail: 'mec3@gearbox.com',
        status: 'recusado',
        description: 'Troca do sistema de escapamento',
        amount: 980,
        prazoEstimadoDias: 4,
      },
      {
        clientKey: 'ana.costa@email.com',
        placa: 'ZXD0E12',
        userEmail: 'mec2@gearbox.com',
        status: 'cancelado',
        description: 'Instalação de central multimídia',
        amount: 1450,
        prazoEstimadoDias: 7,
      },
      {
        clientKey: 'carlos.souza@email.com',
        placa: 'ZXE3F45',
        userEmail: 'mec1@gearbox.com',
        status: 'aberto',
        description: 'Revisão elétrica completa',
        amount: 520,
        prazoEstimadoDias: 3,
      },
    ]

    const budgetMap = new Map<string, Budget[]>()

    for (const budget of budgetsData) {
      const client = clientsMap.get(budget.clientKey)
      const car = carsMap.get(budget.placa)
      const user = usersMap.get(budget.userEmail)

      if (!client || !car || !user) continue

      const record = await Budget.updateOrCreate(
        {
          carId: car.id,
          description: budget.description,
          status: budget.status,
        },
        {
          clientId: client.id,
          carId: car.id,
          userId: user.id,
          createdById: user.id,
          description: budget.description,
          status: budget.status,
          amount: budget.amount.toFixed(2),
          updatedById: user.id,
          prazoEstimadoDias: budget.prazoEstimadoDias ?? null,
        }
      )

      budgetMap.set(car.id, [...(budgetMap.get(car.id) ?? []), record])
    }

    const servicesData: ServiceSeed[] = [
      {
        clientKey: 'joao.silva@email.com',
        placa: 'ZXA1B23',
        status: 'Em andamento',
        description: 'Troca de óleo e filtros',
        totalValue: 450,
        userEmail: 'mec1@gearbox.com',
        prazoEstimadoDias: 5,
        dataPrevistaOffsetDays: 3,
      },
      {
        clientKey: 'maria.santos@email.com',
        placa: 'ZXB4C56',
        status: 'Pendente',
        description: 'Revisão completa',
        totalValue: 1200,
        userEmail: 'mec2@gearbox.com',
        prazoEstimadoDias: 10,
        dataPrevistaOffsetDays: 7,
      },
      {
        clientKey: 'pedro.oliveira@email.com',
        placa: 'ZXC7D89',
        status: 'Concluído',
        description: 'Alinhamento e balanceamento',
        totalValue: 280,
        userEmail: 'mec3@gearbox.com',
        prazoEstimadoDias: 4,
        dataPrevistaOffsetDays: -1,
      },
      {
        clientKey: 'ana.costa@email.com',
        placa: 'ZXD0E12',
        status: 'Em andamento',
        description: 'Troca de pastilhas de freio',
        totalValue: 680,
        userEmail: 'mec2@gearbox.com',
        prazoEstimadoDias: 6,
        dataPrevistaOffsetDays: 4,
      },
      {
        clientKey: 'carlos.souza@email.com',
        placa: 'ZXE3F45',
        status: 'Pendente',
        description: 'Troca de pneus',
        totalValue: 1800,
        userEmail: 'mec1@gearbox.com',
        prazoEstimadoDias: 8,
        dataPrevistaOffsetDays: 5,
      },
      {
        clientKey: 'ana.costa@email.com',
        placa: 'ZXF6G78',
        status: 'Cancelado',
        description: 'Instalação de acessórios',
        totalValue: 900,
        userEmail: 'mec3@gearbox.com',
        prazoEstimadoDias: 2,
        dataPrevistaOffsetDays: -2,
      },
    ]

    for (const service of servicesData) {
      const client = clientsMap.get(service.clientKey)
      const car = carsMap.get(service.placa)

      if (!client || !car) continue

      const serviceUser =
        (service.userEmail && usersMap.get(service.userEmail)) || defaultMechanic || users[0]

      if (!serviceUser) continue

      const budgetsForCar = budgetMap.get(car.id) ?? []
      let budgetReference =
        budgetsForCar.find((record) => record.status === 'aceito') ?? budgetsForCar[0] ?? null

      if (!budgetReference) {
        budgetReference = await Budget.create({
          clientId: client.id,
          carId: car.id,
          userId: serviceUser.id,
          createdById: serviceUser.id,
          description: `Orçamento gerado para serviço: ${service.description}`,
          status: 'aceito',
          amount: service.totalValue.toFixed(2),
          updatedById: serviceUser.id,
          prazoEstimadoDias: service.prazoEstimadoDias ?? null,
        })
        budgetMap.set(car.id, [...budgetsForCar, budgetReference])
      }

      const prazoEstimadoDias = service.prazoEstimadoDias ?? 0
      const baseDate = new Date()
      const dataPrevistaJs =
        service.dataPrevistaOffsetDays !== undefined
          ? new Date(baseDate.getTime() + service.dataPrevistaOffsetDays * 24 * 60 * 60 * 1000)
          : prazoEstimadoDias > 0
            ? new Date(baseDate.getTime() + prazoEstimadoDias * 24 * 60 * 60 * 1000)
            : null
      const dataPrevista = dataPrevistaJs ? DateTime.fromJSDate(dataPrevistaJs) : null

      await Service.updateOrCreate(
        {
          carId: car.id,
          description: service.description,
          status: service.status,
        },
        {
          clientId: client.id,
          userId: serviceUser.id,
          status: service.status,
          description: service.description,
          totalValue: service.totalValue.toFixed(2),
          budgetId: budgetReference?.id ?? null,
          updatedById: serviceUser.id,
          assignedToId: serviceUser.id,
          createdById: serviceUser.id,
          prazoEstimadoDias: prazoEstimadoDias || null,
          dataPrevista,
        }
      )
    }
  }
}
