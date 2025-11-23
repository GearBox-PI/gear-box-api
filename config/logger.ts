import { defineConfig, targets } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  default: 'app',

  loggers: {
    app: {
      enabled: true,
      name: 'application',
      level: 'info',
      transport: {
        targets: targets().push(targets.file({ destination: 1 })).toArray(),
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList {
    app: (typeof loggerConfig.loggers)['app']
  }
}
