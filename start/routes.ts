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
import { readFile } from 'node:fs/promises'

router.get('/', async ({ response }) => {
  const filePath = app.makePath('views', 'index.html')
  if (existsSync(filePath)) {
    response.header('Content-Type', 'text/html; charset=utf-8')
    return response.send(await readFile(filePath, 'utf-8'))
  }

  response.header('Content-Type', 'text/html; charset=utf-8')
  return response.send(`<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gear Box API</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';
      display: grid; min-height: 100dvh; place-items: center; background: #0f172a; color: #e2e8f0; }
    .card { max-width: 780px; padding: 32px; border-radius: 16px; background: #0b1222; box-shadow: 0 10px 30px rgba(0,0,0,.35); }
    h1 { margin: 0 0 12px; font-size: 28px; letter-spacing: .3px; }
    p { margin: 8px 0 20px; color: #cbd5e1; line-height: 1.6; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; }
    a.btn { appearance: none; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
      background: #3b82f6; color: white; padding: 10px 14px; border-radius: 10px; font-weight: 600; }
    a.btn.secondary { background: #1f2937; color: #e5e7eb; }
    code { background: #111827; padding: 2px 6px; border-radius: 6px; color: #93c5fd; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
    @media (min-width: 700px) { .grid { grid-template-columns: 1fr 1fr; } }
    .small { font-size: 12px; opacity: .8; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Gear Box API</h1>
    <p>Bem-vindo! Esta é a API da oficina. Você pode explorar os endpoints e schemas na documentação interativa.</p>
    <div class="actions">
      <a class="btn" href="/docs">Abrir documentação (Swagger UI)</a>
      <a class="btn secondary" href="/docs/openapi.yaml">Baixar OpenAPI (YAML)</a>
    </div>
    <div class="grid" style="margin-top:20px">
      <div>
        <p class="small">Autenticação</p>
        <p>Use o endpoint <code>POST /login</code> para obter o token Bearer. Envie-o no header <code>Authorization: Bearer &lt;token&gt;</code>.</p>
      </div>
      <div>
        <p class="small">Papéis e permissões</p>
        <p>Algumas rotas exigem o papel <code>dono</code>. Outras aceitam <code>dono</code> e <code>mecanico</code>. Veja detalhes no Swagger.</p>
      </div>
    </div>
  </main>
</body>
</html>`)
})

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

router
  .group(() => {
    router.get('/cars', '#controllers/cars_controller.index')
    router.get('/cars/:id', '#controllers/cars_controller.show')
    router.post('/cars', '#controllers/cars_controller.store')
    router.put('/cars/:id', '#controllers/cars_controller.update')
    router.patch('/cars/:id', '#controllers/cars_controller.update')
    router.delete('/cars/:id', '#controllers/cars_controller.destroy')
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('/services', '#controllers/services_controller.index')
    router.get('/services/:id', '#controllers/services_controller.show')
    router.post('/services', '#controllers/services_controller.store')
    router.put('/services/:id', '#controllers/services_controller.update')
    router.patch('/services/:id', '#controllers/services_controller.update')
    router.delete('/services/:id', '#controllers/services_controller.destroy')
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('/budgets', '#controllers/budgets_controller.index')
    router.get('/budgets/:id', '#controllers/budgets_controller.show')
    router.post('/budgets', '#controllers/budgets_controller.store')
    router.put('/budgets/:id', '#controllers/budgets_controller.update')
    router.patch('/budgets/:id', '#controllers/budgets_controller.update')
    router.delete('/budgets/:id', '#controllers/budgets_controller.destroy')
    router.post('/budgets/:id/accept', '#controllers/budgets_controller.accept')
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
  const filePath = app.makePath('views', 'docs.html')
  if (existsSync(filePath)) {
    response.header('Content-Type', 'text/html; charset=utf-8')
    return response.send(await readFile(filePath, 'utf-8'))
  }

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

// Nova rota: Guia de uso da API
router.get('/guide', async ({ response }) => {
  const filePath = app.makePath('views', 'guide.html')
  if (existsSync(filePath)) {
    response.header('Content-Type', 'text/html; charset=utf-8')
    return response.send(await readFile(filePath, 'utf-8'))
  }
  return response.redirect('/')
})

// Assets estáticos da pasta views
router.get('/views/styles/:file', async ({ params, response }) => {
  const filePath = app.makePath('views', 'styles', params.file)
  if (!existsSync(filePath)) return response.status(404).send('Not Found')
  response.header('Content-Type', 'text/css; charset=utf-8')
  return response.download(filePath)
})

router.get('/views/js/:file', async ({ params, response }) => {
  const filePath = app.makePath('views', 'js', params.file)
  if (!existsSync(filePath)) return response.status(404).send('Not Found')
  response.header('Content-Type', 'application/javascript; charset=utf-8')
  return response.download(filePath)
})
