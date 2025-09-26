# Gear Box API

> **Aviso:** Este README é temporário e serve exclusivamente para orientar o setup do ambiente de desenvolvimento. Não utilize estas instruções em ambiente de produção.

Este projeto utiliza Docker apenas para o banco de dados; a aplicação deve ser executada localmente. Siga os passos abaixo para iniciar o banco com Docker e executar as migrations pela aplicação local.

## Configuração do arquivo .env

Antes de iniciar o container do banco de dados, é necessário configurar as variáveis de ambiente. O projeto possui um arquivo `.env.example` que serve como modelo das variáveis necessárias.

Crie o arquivo `.env` na raiz do projeto copiando o exemplo:

```zsh
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário, ajustando as configurações de banco de dados, porta, usuário, senha, etc.

**Importante:**
Ao utilizar o banco de dados via Docker, configure as variáveis de conexão no `.env` para apontar para o serviço do container. Exemplo:

```
DB_HOST=localhost
DB_PORT=5432 # ou a porta definida no docker-compose.yml
DB_USER=usuario
DB_PASSWORD=senha
DB_DATABASE=nome_do_banco
```

Se o banco estiver rodando em uma porta diferente, ajuste o valor de `DB_PORT` conforme definido no `docker-compose.yml`.

## Pré-requisitos

- Docker instalado ([Guia de instalação](https://docs.docker.com/get-docker/))
- Docker Compose instalado ([Guia de instalação](https://docs.docker.com/compose/install/))

## 1. Subindo o banco de dados com Docker Compose

No diretório raiz do projeto, execute:

```zsh
docker-compose up -d
```

Esse comando irá iniciar apenas o serviço do banco de dados definido no arquivo `docker-compose.yml`.

Para verificar se o container do banco está em execução:

```zsh
docker-compose ps
```

## 2. Executando as migrations

Com o banco de dados ativo no Docker e o `.env` devidamente configurado, execute as migrations localmente:

```zsh
node ace migration:run
```

Esse comando irá criar as tabelas necessárias no banco de dados do container.

## 3. Dicas adicionais

- Para parar os containers:
  ```zsh
  docker-compose down
  ```
- Para executar as migrations novamente:
  ```zsh
  node ace migration:run
  ```
- Para desfazer as migrations:
  ```zsh
  node ace migration:rollback
  ```

## 4. Resolução de problemas comuns

- Certifique-se de que as variáveis de ambiente estão configuradas corretamente no arquivo `.env`.
- Se o banco não conectar, verifique se o serviço do banco está ativo no Docker.

---

Em caso de dúvidas, consulte a documentação do AdonisJS ou entre em contato com o responsável pelo projeto.

## Coleções de API (Thunder Client / Insomnia / Postman)

Esta seção documenta as coleções (endpoints) que devem ser configuradas nas ferramentas de teste de API. Por enquanto há apenas a coleção de Autenticação (Login). Futuramente adicionaremos budgets, clients, cars etc.

### 1. Autenticação / Login

Endpoint responsável por gerar o token de acesso (Bearer) usado nas rotas protegidas.

| Campo   | Valor                            |
| ------- | -------------------------------- |
| Método  | `POST`                           |
| URL     | `http://localhost:3333/sessions` |
| Headers | `Content-Type: application/json` |
| Auth    | Nenhuma (login público)          |

#### Payload de Requisição

```json
{
  "email": "dono@gearbox.com",
  "password": "senha123"
}
```

Observações:

- A propriedade enviada é `password` mesmo que a coluna no banco seja `senha` (mapeado via AuthFinder no modelo `User`).
- Usuários de teste são criados pelo seeder (`node ace db:seed`).

#### Resposta de Sucesso (200)

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
    "value": "<jwt|opaque_token>",
    "abilities": ["*"],
    "expiresAt": "2025-01-01T12:00:00.000Z"
  }
}
```

Use o valor de `token.value` em chamadas protegidas no header:

```
Authorization: Bearer <token.value>
```

#### Erros (400) – Credenciais Inválidas

```json
{
  "errors": [
    {
      "message": "Invalid credentials",
      "code": "E_INVALID_CREDENTIALS"
    }
  ]
}
```

#### Passos Rápidos para Configurar no Thunder Client

1. Criar nova Collection: `Auth`.
2. Adicionar Request `Login`.
3. Método `POST`, URL `http://localhost:3333/sessions`.
4. Aba Body -> JSON -> inserir payload acima.
5. Enviar e copiar `token.value` para variável de ambiente (ex: `{{authToken}}`).
6. Nas próximas requisições protegidas: Header `Authorization: Bearer {{authToken}}`.

#### Variáveis Sugeridas

| Nome           | Valor Exemplo           |
| -------------- | ----------------------- |
| `baseUrl`      | `http://localhost:3333` |
| `authEmail`    | `dono@gearbox.com`      |
| `authPassword` | `senha123`              |
| `authToken`    | (preenchido após login) |

#### Checklist para o Login Funcionar

| Verificação                          | OK  |
| ------------------------------------ | --- |
| Banco rodando (Docker)               |     |
| `.env` configurado                   |     |
| Migrações executadas                 |     |
| Seeders executados                   |     |
| Servidor `npm run dev` ativo         |     |
| Request `POST /sessions` retorna 200 |     |
| Token salvo para uso posterior       |     |

---

### Futuras Coleções Planejadas

- Users (admin)
- Clients
- Cars
- Budgets

Cada nova coleção seguirá o mesmo padrão: tabela de resumo, payloads exemplo, respostas e erros.
