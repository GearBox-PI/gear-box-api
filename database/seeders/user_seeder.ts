import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class UserSeeder extends BaseSeeder {
  public static environment = ['development', 'testing']

  async run() {
    const users = [
      {
        nome: 'Admin da Oficina',
        email: 'dono@gearbox.com',
        senha: 'senha123',
        tipo: 'dono' as const,
      },
      {
        nome: 'Mec 1',
        email: 'mec1@gearbox.com',
        senha: 'senha123',
        tipo: 'mecanico' as const,
      },
      {
        nome: 'Mec 2',
        email: 'mec2@gearbox.com',
        senha: 'senha123',
        tipo: 'mecanico' as const,
      },
      {
        nome: 'Mec 3',
        email: 'mec3@gearbox.com',
        senha: 'senha123',
        tipo: 'mecanico' as const,
      },
    ]

    await User.updateOrCreateMany('email', users)
  }
}
