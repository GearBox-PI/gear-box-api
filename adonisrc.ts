/*
|--------------------------------------------------------------------------
| AdonisRC File
|--------------------------------------------------------------------------
|
| Este arquivo controla quais diretórios, arquivos, comandos e providers
| fazem parte do runtime do Adonis.
|
*/

import { defineConfig } from '@adonisjs/core/app'
import type { MetaFileNode } from '@adonisjs/application/types'

/*
|--------------------------------------------------------------------------
| Meta Files
|--------------------------------------------------------------------------
|
| Apenas os diretórios necessários são copiados durante o build. Todo o
| restante — incluindo testes, migrations, seeders, arquivos TS e sourcemaps —
| fica de fora do bundle final.
|
*/
const metaIncludePatterns = [
  'app/**',
  'start/**',
  'config/**',
  'bin/**',
  'ace.js',
  'public/**',
  'resources/views/**',
]

const metaExcludePatterns = [
  'tests/**',
  'database/**',
  'database/migrations/**',
  'database/seeders/**',
  '**/*.map',
  '**/*.ts',
  'resources/js/**',
]

const staticAssets = ['ace.js', 'public/**', 'resources/views/**']

const metaFiles: MetaFileNode[] = [
  ...metaIncludePatterns.map((pattern) => ({
    pattern,
    reloadServer: !staticAssets.includes(pattern),
  })),
  ...metaExcludePatterns.map((pattern) => ({
    pattern: `!${pattern}`,
    reloadServer: false,
  })),
]

const providers = [
  () => import('@adonisjs/core/providers/app_provider'),
  () => import('@adonisjs/core/providers/hash_provider'),
  {
    file: () => import('@adonisjs/core/providers/repl_provider'),
    environment: ['repl', 'test'],
  },
  () => import('@adonisjs/core/providers/vinejs_provider'),
  () => import('@adonisjs/cors/cors_provider'),
  () => import('@adonisjs/lucid/database_provider'),
  () => import('@adonisjs/auth/auth_provider'),
  () => import('@adonisjs/mail/mail_provider'),
]

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Providers
  |--------------------------------------------------------------------------
  */
  providers,

  /*
  |--------------------------------------------------------------------------
  | Commands
  |--------------------------------------------------------------------------
  */
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Preloads
  |--------------------------------------------------------------------------
  */
  preloads: [
    () => import('./start/kernel.js'),
    () => import('./start/routes.js'),
  ],

  /*
  |--------------------------------------------------------------------------
  | AQUI ESTÁ O SEGREDO DO BUILD LIMPO
  |--------------------------------------------------------------------------
  */
  metaFiles,

  /*
  |--------------------------------------------------------------------------
  | Ponto de entrada do servidor
  |--------------------------------------------------------------------------
  */
  ...( {
    entrypoints: {
      commands: './bin/console.ts',
      http: './bin/server.ts',
    },
  } as any ),

  /*
  |--------------------------------------------------------------------------
  | Configs de build
  |--------------------------------------------------------------------------
  */
  build: {
    dev: false,
    sourcemaps: false,
    minify: true,
  },
})
