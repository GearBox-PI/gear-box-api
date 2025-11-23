import { defineConfig } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  default: 'app',

  loggers: {
    app: {
      enabled: true,
      name: 'application',
      level: 'info',
      /**
       * No transport → usa Pino padrão
       * 100% compatível com Azure App Service (stdout)
       */
    },
  },
})

export default loggerConfig

/**
 * Tipagem do Adonis para o logger "app"
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList {
    app: typeof loggerConfig.loggers.app
  }
}
