/*
 * Inicializa o container do Adonis para uso em scripts externos.
 * Deve ser importado via "--import ./scripts/bootstrap.js" (versão compilada)
 * antes de qualquer acesso aos serviços.
 */

import { IgnitorFactory } from '@adonisjs/core/factories'
import { fileURLToPath } from 'node:url'

const ignitor = new IgnitorFactory()
const app = await ignitor.create(fileURLToPath(new URL('../', import.meta.url)))
await app.boot()
