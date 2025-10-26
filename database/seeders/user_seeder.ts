import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    type SeedUser = {
      nome: string
      email: string
      senha: string
      tipo: 'dono' | 'mecanico'
    }

    const users: SeedUser[] = [
      {
        nome: 'Admin da Oficina',
        email: 'dono@gearbox.com',
        senha: 'senha123',
        tipo: 'dono',
      },
      {
        nome: 'Mec 1',
        email: 'mec1@gearbox.com',
        senha: 'senha123',
        tipo: 'mecanico',
      },
      {
        nome: 'Mec 2',
        email: 'mec2@gearbox.com',
        senha: 'senha123',
        tipo: 'mecanico',
      },
      {
        nome: 'Mec 3',
        email: 'mec3@gearbox.com',
        senha: 'senha123',
        tipo: 'mecanico',
      },
    ]

    for (const data of users) {
      await User.updateOrCreate(
        { email: data.email },
        {
          nome: data.nome,
          tipo: data.tipo,
          senha: data.senha,
        }
      )
    }
  }
}
