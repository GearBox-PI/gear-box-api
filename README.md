# Gear Box API

> Aviso: Este README orienta o setup de desenvolvimento. Não utilize estas instruções em produção.

Este projeto usa Docker apenas para o banco de dados (PostgreSQL). A aplicação AdonisJS roda localmente (Node.js).

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm
- Docker Desktop (com `docker compose` habilitado)

## TL;DR (passo a passo)

```bash
# 1) Instale dependências
npm i

# 2) Crie o .env a partir do exemplo
cp .env.example .env

# 3) Ajuste o .env para usar o Postgres do docker-compose
#    Valores recomendados (bata com o docker-compose.yml):
#    DB_HOST=localhost
#    DB_PORT=5432
#    DB_USER=gearbox
#    DB_PASSWORD=gearbox
#    DB_DATABASE=gearbox_dev

# 4) Gere a APP_KEY (necessário para rodar Ace e o app)
node ace generate:key

# 5) Suba o banco de dados
docker compose up -d

# 6) Rode as migrações
node ace migration:run

# 7) Rode os seeders (cria usuários de teste)
node ace db:seed

# 8) Rode a API em modo desenvolvimento (HMR)
npm run dev
```

Observações:

- Se você não usa Git Bash/WSL, no Windows o comando de cópia pode ser diferente. Alternativas: PowerShell `Copy-Item .env.example .env`.
- Se mudar as portas no `docker-compose.yml`, alinhe o `DB_PORT` no `.env`.

## Configuração do .env (exemplo mínimo funcional)

```env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY= # será preenchida pelo "node ace generate:key"
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=gearbox
DB_PASSWORD=gearbox
DB_DATABASE=gearbox_dev
# Opcional para testes automatizados (usa quando NODE_ENV=test)
# DB_DATABASE_TEST=gearbox_test
```

## Documentação da API

- OpenAPI (YAML): <http://localhost:3333/docs/openapi.yaml>
- Swagger UI: <http://localhost:3333/docs>
  - Clique em “Authorize” e informe: `Bearer <seu-token>`
  - Você pode importar o YAML no Postman/Insomnia: abra o app > Import > selecione `docs/openapi.yaml`.

Notas de autorização:

- Endpoints de usuários exigem Bearer token válido.
- Listar, criar e remover usuários exigem papel "dono" (veja descrição e x-required-role no Swagger).

### Usuários seed (para login rápido)

- dono: `dono@gearbox.com` / `senha123`
- mecanico: `mec1@gearbox.com` / `senha123`

Exemplo de login (curl):

```bash
curl -sS -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dono@gearbox.com","password":"senha123"}'
```

## Comandos úteis

- Subir/derrubar banco:
  - `docker compose up -d`
  - `docker compose down`
- Migrações:
  - `node ace migration:run`
  - `node ace migration:rollback`
- Seeders:
  - `node ace db:seed`
- Desenvolvimento:
  - `npm run dev`

## Testes automatizados

Ambiente de testes usa `NODE_ENV=test`. Opcionalmente, defina `DB_DATABASE_TEST` para isolar o banco.

- Rodar testes:

```bash
npm test
```

O bootstrap derruba/roda migrações e executa seed automaticamente para o ambiente de teste.

## Autenticação

### Login

- Método: `POST`
- URL: `http://localhost:3333/login`
- Headers: `Content-Type: application/json`
- Payload:

```json
{
  "email": "dono@gearbox.com",
  "password": "senha123"
}
```

Resposta 200 (exemplo):

```json
{
  "user": {
    "id": "<uuid>",
    "nome": "Admin da Oficina",
    "email": "dono@gearbox.com",
    "tipo": "dono"
  },
  "token": {
    "type": "bearer",
    "value": "<token>",
    "abilities": ["*"],
    "expiresAt": "2025-01-01T12:00:00.000Z"
  }
}
```

Use nas rotas protegidas:

```http
Authorization: Bearer <token>
```

### Logout

- Método: `DELETE`
- URL: `http://localhost:3333/logout`
- Headers: `Authorization: Bearer <token>`
- Efeito: revoga todos os tokens do usuário autenticado.
- Resposta: `204 No Content`

## Prettier (formatação de código)

Instalação (dev):

```bash
npm i -D prettier
```

Checar formatação:

```bash
npx prettier --check .
```

Aplicar formatação:

```bash
npx prettier --write .
```

Scripts (opcional) no package.json:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

Configuração opcional (.prettierrc):

```json
{
  "singleQuote": true,
  "semi": false,
  "trailingComma": "all",
  "printWidth": 100
}
```

## Solução de problemas

- EnvValidationException: Missing APP_KEY
  - Rode `node ace generate:key` para preencher a APP_KEY no `.env`.
- Erro de conexão ao Postgres
  - Verifique se o container está ativo: `docker compose ps`.
  - Confirme que `DB_HOST/PORT/USER/PASSWORD/DB` no `.env` batem com o `docker-compose.yml`.
- Porta 3333 ocupada
  - Ajuste `PORT` no `.env` e reinicie `npm run dev`.

## Notas para Windows

- O Docker Desktop para Windows pode exigir configuração adicional para compartilhar volumes corretamente.
- Certifique-se de que o WSL 2 está instalado e habilitado, pois o Docker Desktop o utiliza como backend por padrão.
- Para desempenho ideal, ajuste as configurações de recursos do Docker Desktop (CPU, memória, disco) conforme necessário.
