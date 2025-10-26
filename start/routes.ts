/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import app from '@adonisjs/core/services/app'
import { existsSync } from 'node:fs'

router.post('/login', '#controllers/session_controller.store')
router.delete('/logout', '#controllers/session_controller.destroy').use(middleware.auth())

router
  .group(() => {
    router.get('/users', '#controllers/users_controller.index')
    router.get('/users/:id', '#controllers/users_controller.show')
    router.post('/users', '#controllers/users_controller.store')
    router.put('/users/:id', '#controllers/users_controller.update')
    router.patch('/users/:id', '#controllers/users_controller.update')
    router.delete('/users/:id', '#controllers/users_controller.destroy')
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('/clients', '#controllers/clients_controller.index')
    router.get('/clients/:id', '#controllers/clients_controller.show')
    router.post('/clients', '#controllers/clients_controller.store')
    router.put('/clients/:id', '#controllers/clients_controller.update')
    router.patch('/clients/:id', '#controllers/clients_controller.update')
    router.delete('/clients/:id', '#controllers/clients_controller.destroy')
  })
  .use(middleware.auth())

router.get('/docs/openapi.yaml', async ({ response }) => {
  const yamlPath = app.makePath('docs', 'openapi.yaml')
  const ymlPath = app.makePath('docs', 'openapi.yml')
  const filePath = existsSync(yamlPath) ? yamlPath : existsSync(ymlPath) ? ymlPath : null

  if (!filePath) {
    return response.status(404).send({
      error: 'Arquivo OpenAPI não encontrado. Crie docs/openapi.yaml ou docs/openapi.yml',
    })
  }

  response.header('Content-Type', 'application/yaml; charset=utf-8')
  return response.download(filePath)
})

router.get('/docs/openapi.yml', async ({ response }) => {
  return response.redirect('/docs/openapi.yaml')
})

router.get('/docs', async ({ response }) => {
  response.header('Content-Type', 'text/html; charset=utf-8')
  return response.send(`<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <title>Gear Box API - Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style> body { margin: 0 } .swagger-ui .topbar { display: none } </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/docs/openapi.yaml',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout'
      })
    }
  </script>
</body>
</html>`)
})
