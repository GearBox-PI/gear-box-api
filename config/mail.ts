import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'
import { InferMailers } from '@adonisjs/mail/types'

const secure = env.get('MAIL_SECURE', false)
const ignoreTls = env.get('MAIL_IGNORE_TLS', false)

const mailConfig = defineConfig({
  default: 'smtp',
  from: env.get('MAIL_FROM', 'Gear Box <no-reply@gearbox.com>'),
  mailers: {
    smtp: transports.smtp({
      host: env.get('MAIL_HOST'),
      port: env.get('MAIL_PORT'),
      secure,
      tls: ignoreTls
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
      auth:
        env.get('MAIL_USERNAME') && env.get('MAIL_PASSWORD')
          ? {
              type: 'login',
              user: env.get('MAIL_USERNAME'),
              pass: env.get('MAIL_PASSWORD'),
            }
          : undefined,
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
