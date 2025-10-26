import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    const senhaHashed = await hash.make('senha123')

    await User.updateOrCreateMany('email', [
      {
        nome: 'Admin da Oficina',
        email: 'dono@gearbox.com',
        senha: senhaHashed,
        tipo: 'dono',
      },
      {
        nome: 'Mec 1',
        email: 'mec1@gearbox.com',
        senha: senhaHashed,
        tipo: 'mecanico',
      },
      {
        nome: 'Mec 2',
        email: 'mec2@gearbox.com',
        senha: senhaHashed,
        tipo: 'mecanico',
      },
      {
        nome: 'Mec 3',
        email: 'mec3@gearbox.com',
        senha: senhaHashed,
        tipo: 'mecanico',
      },
    ])
  }
}
