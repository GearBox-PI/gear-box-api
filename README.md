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
#    DB_HOST=seu_host_pg
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
APP_NAME=Gear Box API
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
APP_KEY= # será preenchida pelo "node ace generate:key"
NODE_ENV=development
CORS_ALLOWED_ORIGINS=https://app.seudominio.com
DB_HOST=seu_host_pg
DB_PORT=5432
DB_USER=gearbox
DB_PASSWORD=gearbox
DB_DATABASE=gearbox_dev
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=false
# Opcional para testes automatizados (usa quando NODE_ENV=test)
# DB_DATABASE_TEST=gearbox_test

MAIL_HOST=smtp.example.com
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM="Gear Box <no-reply@gearbox.com>"
MAIL_SECURE=false
MAIL_IGNORE_TLS=false
```

> Em bancos gerenciados (como Azure Database for PostgreSQL), defina `DB_SSL=true`. Caso o servidor use certificados internos, ajuste `DB_SSL_REJECT_UNAUTHORIZED=false` até instalar o certificado confiável.

## Documentação da API

- OpenAPI (YAML): <https://gearbox.example.com/docs/openapi.yaml>
- Swagger UI: <https://gearbox.example.com/docs>
  - Clique em “Authorize” e informe: `Bearer <seu-token>`
  - Você pode importar o YAML no Postman/Insomnia: abra o app > Import > selecione `docs/openapi.yaml`.

Notas de autorização:

- Endpoints de usuários exigem Bearer token válido.
- Listar, criar e remover usuários exigem papel "dono" (veja descrição e x-required-role no Swagger).

### Usuários seed (para login rápido)

- dono: `dono@gearbox.com` / `senha123`
- mecanico: `mec1@gearbox.com` / `senha123`
- mecanico: `mec2@gearbox.com` / `senha123`
- mecanico: `mec3@gearbox.com` / `senha123`

Exemplo de login (curl):

```bash
curl -sS -X POST https://gearbox.example.com/login \
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

## Deploy / Produção

1. Ajuste o `.env` com credenciais reais (APP*KEY, DB*\*, PORT/HOST). Gere a chave se ainda não existir:

   ```bash
   node ace generate:key
   ```

2. Instale dependências e gere o build:

   ```bash
   npm install --omit=dev
   npm run build
   ```

3. Execute as migrações usando as credenciais de produção:

   ```bash
   NODE_ENV=production node ace migration:run
   ```

4. Inicie a API a partir do bundle compilado (ideal para sistemas init ou containers):

   ```bash
   npm start
   ```

   > Dica: em imagens Docker de produção, use multi-stage build para copiar apenas `build/` e o `.env` configurado, garantindo pacotes enxutos.

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
- URL: `https://gearbox.example.com/login`
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
    "abilities": [
      "clients:read",
      "clients:write",
      "cars:read",
      "cars:write",
      "services:read",
      "services:write"
    ],
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
- URL: `https://gearbox.example.com/logout`
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

## 📄 Licença

Este projeto é licenciado sob os termos da **GNU Affero General Public License v3.0 (AGPL-3.0)**.

Isso significa que:
- qualquer modificação ou derivação deve permanecer como software livre;
- melhorias feitas por terceiros precisam ser disponibilizadas publicamente
  caso o software seja utilizado via rede (como serviço web);
- cópias, redistribuições ou forks devem manter a mesma licença.

Para consultar o texto completo da licença, acesse o arquivo [LICENSE](./LICENSE)
ou visite https://www.gnu.org/licenses/agpl-3.0.html.
