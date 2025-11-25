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

import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class UserSeeder extends BaseSeeder {
  public static environment = ['development', 'testing', 'production']

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
