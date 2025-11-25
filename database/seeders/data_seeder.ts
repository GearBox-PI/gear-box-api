import { BaseSeeder } from '@adonisjs/lucid/seeders'
import UserSeeder from './user_seeder.js'
import VehicleSeeder from './vehicle_seeder.js'
import BudgetSeeder from './budget_seeder.js'
import ServiceSeeder from './service_seeder.js'

export default class DataSeeder extends BaseSeeder {
  public static environment = ['development', 'testing', 'production']

  async run() {
    await new UserSeeder(this.client).run()
    await new VehicleSeeder(this.client).run()
    await new BudgetSeeder(this.client).run()
    await new ServiceSeeder(this.client).run()
  }
}
