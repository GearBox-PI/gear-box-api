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
