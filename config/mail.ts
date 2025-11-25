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

import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'
import { InferMailers } from '@adonisjs/mail/types'

const secure = env.get('MAIL_SECURE', false)
const ignoreTls = env.get('MAIL_IGNORE_TLS', false)

const mailUsername = env.get('MAIL_USERNAME')
const mailPassword = env.get('MAIL_PASSWORD')

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
        mailUsername && mailPassword
          ? {
              type: 'login',
              user: mailUsername,
              pass: mailPassword,
            }
          : undefined,
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
