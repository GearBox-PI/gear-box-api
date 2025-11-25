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

/*
|--------------------------------------------------------------------------
| JavaScript entrypoint for running ace commands
|--------------------------------------------------------------------------
|
| DO NOT MODIFY THIS FILE AS IT WILL BE OVERRIDDEN DURING THE BUILD
| PROCESS.
|
| See docs.adonisjs.com/guides/typescript-build-process#creating-production-build
|
| Since, we cannot run TypeScript source code using "node" binary, we need
| a JavaScript entrypoint to run ace commands.
|
| This file registers the "ts-node/esm" hook with the Node.js module system
| and then imports the "bin/console.ts" file.
|
*/

const PRODUCTION_FLAG = '--production'
const runtimeArgs = process.argv.slice(2)
let shouldForceProduction = false
const filteredArgs = runtimeArgs.filter((arg) => {
  if (arg === PRODUCTION_FLAG) {
    shouldForceProduction = true
    return false
  }
  return true
})

if (shouldForceProduction) {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production'
  }
  process.argv.splice(2, process.argv.length - 2, ...filteredArgs)
}

/**
 * Register hook to process TypeScript files using ts-node
 */
import 'ts-node-maintained/register/esm'

/**
 * Import ace console entrypoint
 */
await import('./bin/console.js')
