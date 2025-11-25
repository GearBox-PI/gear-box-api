import mail from '@adonisjs/mail/services/main'
import logger from '@adonisjs/core/services/logger'

import Budget from '#models/budget'
import Car from '#models/car'
import Client from '#models/client'
import Service from '#models/service'
import ServiceCreated from '#mailers/ServiceCreated'

export type EmailDispatchResult =
  | { status: 'sent'; message: string; messageId?: string }
  | { status: 'skipped' | 'failed'; message: string; error?: unknown }

export default class MailService {
  static async sendServiceCreatedEmail(
    customer: Client,
    budget: Budget,
    service: Service
  ): Promise<EmailDispatchResult> {
    if (!customer.email) {
      const message = 'Cliente sem e-mail cadastrado, envio ignorado.'
      logger.warn(message)
      return { status: 'skipped', message }
    }

    const car = await MailService.getCar(service, budget)
    const estimatedDays = service.prazoEstimadoDias ?? budget.prazoEstimadoDias ?? null
    const serviceStart = service.createdAt?.toJSDate() ?? budget.createdAt?.toJSDate() ?? new Date()

    let forecastDate: Date | null = null
    if (service.dataPrevista) {
      forecastDate = service.dataPrevista.toJSDate()
    } else if (estimatedDays) {
      forecastDate = new Date(serviceStart.getTime() + estimatedDays * 24 * 60 * 60 * 1000)
    }

    try {
      const response = await mail.send(
        new ServiceCreated({
          customerName: customer.nome,
          customerEmail: customer.email,
          budgetNumber: budget.id,
          carModel: car?.modelo ?? null,
          carPlate: car?.placa ?? null,
          estimatedDays,
          initialStatus: service.status,
          startDate: serviceStart,
          forecastDate,
        })
      )

      const message = 'E-mail de criação de serviço enviado com sucesso.'
      logger.info(
        {
          messageId: response.messageId,
          to: customer.email,
          budgetId: budget.id,
          serviceId: service.id,
        },
        message
      )

      return { status: 'sent', message, messageId: response.messageId }
    } catch (error) {
      const message = 'Falha ao enviar e-mail de criação de serviço.'
      logger.error({ error, budgetId: budget.id, serviceId: service.id }, message)
      return { status: 'failed', message, error }
    }
  }

  private static async getCar(service: Service, budget: Budget): Promise<Car | null> {
    const carId = service.carId ?? budget.carId
    if (!carId) return null

    const car = await Car.find(carId)
    return car ?? null
  }
}
