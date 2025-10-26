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

## Solução de problemas

- EnvValidationException: Missing APP_KEY
  - Rode `node ace generate:key` para preencher a APP_KEY no `.env`.
- Erro de conexão ao Postgres
  - Verifique se o container está ativo: `docker compose ps`.
  - Confirme que `DB_HOST/PORT/USER/PASSWORD/DB` no `.env` batem com o `docker-compose.yml`.
- Porta 3333 ocupada
  - Ajuste `PORT` no `.env` e reinicie `npm run dev`.

---

## Coleções de API (Thunder Client / Insomnia / Postman)

Por ora há a coleção de Autenticação (Login). Outras (budgets, clients, cars) serão adicionadas.

### 1. Autenticação / Login

- Método: `POST`
- URL: `http://localhost:3333/sessions`
- Headers: `Content-Type: application/json`
- Auth: Nenhuma (login público)

Payload:

```json
{
  "email": "dono@gearbox.com",
  "password": "senha123"
}
```

Observações:

- O campo enviado é `password` (mesmo que a coluna seja `senha`).
- Usuários de teste são criados pelo seeder (`node ace db:seed`).

Resposta 200 (exemplo simplificado):

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

Use o `token.value` nas rotas protegidas:

```http
Authorization: Bearer <token.value>
```

Checklist rápido:

- Banco rodando (Docker)
- `.env` configurado
- `node ace migration:run`
- `node ace db:seed`
- `npm run dev` ativo
- `POST /sessions` retorna 200 e token
