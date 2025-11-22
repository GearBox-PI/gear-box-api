import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'

type ServiceCreatedMailData = {
  customerName: string
  customerEmail: string
  budgetNumber: string
  carModel?: string | null
  carPlate?: string | null
  estimatedDays?: number | null
  initialStatus: string
}

export default class ServiceCreated extends BaseMail {
  constructor(private data: ServiceCreatedMailData) {
    super()
  }

  from = env.get('MAIL_FROM', 'Gear Box <no-reply@gearbox.com>')

  subject = 'Seu serviço foi aberto na Gear Box 🚗🔧'

  prepare() {
    this.message
      .to(this.data.customerEmail)
      .from(this.from)
      .subject(this.subject)
      .html(this.buildHtml())
  }

  private buildHtml(): string {
    const estimated =
      typeof this.data.estimatedDays === 'number'
        ? `${this.data.estimatedDays} dia${this.data.estimatedDays === 1 ? '' : 's'}`
        : 'Não informado'

    const carModel = this.data.carModel ?? 'Não informado'
    const carPlate = this.data.carPlate ?? 'Não informado'

    return `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Serviço criado</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background: #f3f5f7;
        color: #0f172a;
      }
      .wrapper {
        max-width: 640px;
        margin: 0 auto;
        padding: 24px 16px 32px;
      }
      .card {
        background: #ffffff;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      }
      .eyebrow {
        color: #64748b;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-size: 12px;
        margin: 0 0 6px;
      }
      h1 {
        font-size: 22px;
        margin: 0 0 12px;
      }
      p {
        line-height: 1.6;
        margin: 0 0 12px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 12px;
        margin-top: 18px;
      }
      .label {
        color: #475569;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
      }
      .value {
        font-size: 16px;
        font-weight: 600;
        margin: 2px 0 0;
        color: #0f172a;
      }
      .footer {
        margin-top: 20px;
        color: #475569;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <p class="eyebrow">Gear Box</p>
        <h1>Serviço aberto</h1>
        <p>Olá, ${this.data.customerName}! O seu serviço foi aberto na Gear Box.</p>
        <p>Seguem os principais detalhes:</p>

        <div class="grid">
          <div>
            <p class="label">Número do orçamento</p>
            <p class="value">${this.data.budgetNumber}</p>
          </div>
          <div>
            <p class="label">Modelo do carro</p>
            <p class="value">${carModel}</p>
          </div>
          <div>
            <p class="label">Placa</p>
            <p class="value">${carPlate}</p>
          </div>
          <div>
            <p class="label">Prazo estimado</p>
            <p class="value">${estimated}</p>
          </div>
          <div>
            <p class="label">Status inicial</p>
            <p class="value">${this.data.initialStatus}</p>
          </div>
        </div>

        <p class="footer">
          Qualquer dúvida é só responder este e-mail. Obrigado por confiar na Gear Box!
        </p>
      </div>
    </div>
  </body>
</html>`
  }
}
