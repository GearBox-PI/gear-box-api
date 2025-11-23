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

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Providers
  |--------------------------------------------------------------------------
  */
  providers: [
    () => import('@adonisjs/core'),
    () => import('@adonisjs/lucid'),
    () => import('@adonisjs/mail'),
  ],

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
    () => import('./start/kernel'),
    () => import('./start/routes'),
  ],

  /*
  |--------------------------------------------------------------------------
  | AQUI ESTÁ O SEGREDO DO BUILD LIMPO
  |--------------------------------------------------------------------------
  */
  metaFiles: {
    /*
    | Não copiar TUDO como estava antes. Copiar apenas o essencial.
    */
    patterns: [
      'public/**',          // apenas se usar arquivos estáticos
      'resources/views/**', // apenas se usar view engine — se API only, remova
      'start/**',           // necessário
      'app/**',             // código da aplicação
      'config/**',          // configs
      'ace.js',             // cli build
      'bin/**',             // entrypoints
    ],

    /*
    | NÃO copiar:
    | - tests
    | - database
    | - .map
    | - arquivos TS
    | - configs duplicadas
    | - migrações
    | - seeds
    */
    exclude: [
      '**/*.spec.ts',
      '**/*.spec.js',
      '**/*.map',
      'tests/**',
      'database/**',
      'resources/js/**',
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Ponto de entrada do servidor
  |--------------------------------------------------------------------------
  */
  entrypoints: {
    commands: './bin/console.ts',
    http: './bin/server.ts',
  },

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
