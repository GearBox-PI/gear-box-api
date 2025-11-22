import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const rawOrigins = env.get('CORS_ALLOWED_ORIGINS', '*')
const allowAllOrigins = rawOrigins === '*' || rawOrigins.trim() === ''
const allowedOrigins = allowAllOrigins
  ? true
  : rawOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0)

const corsConfig = defineConfig({
  enabled: true,
  origin:
    allowedOrigins === true
      ? true
      : allowedOrigins.length === 0
        ? true
        : allowedOrigins,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  headers: true,
  exposeHeaders: ['Authorization'],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
