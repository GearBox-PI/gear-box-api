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

import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Padroniza mensagem de credenciais inválidas para casar com os testes
    if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
      return ctx.response.status(400).send({
        errors: [
          {
            message: 'Invalid credentials',
            code: 'E_INVALID_CREDENTIALS',
          },
        ],
      })
    }

    // Erros de validação (Vine) - detecta pela forma do objeto
    if (
      typeof error === 'object' &&
      error !== null &&
      'messages' in error &&
      Array.isArray((error as any).messages)
    ) {
      const messages = (error as any).messages as Array<{
        message: string
        field: string
        rule?: string
      }>
      return ctx.response.status(422).send({
        errors: messages.map((m) => ({
          message: m.message,
          code: m.rule ?? 'E_VALIDATION_ERROR',
          field: m.field,
        })),
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
