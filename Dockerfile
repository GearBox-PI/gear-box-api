# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build ----------
FROM deps AS builder
COPY . .

# Compila o Adonis para produção (gera a pasta build/)
RUN npm run build

# Remove dependências de desenvolvimento após o build
RUN npm prune --omit=dev

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S adonis && adduser -S adonis -G adonis

# Copia build, dependências e base de dados (por garantia)
COPY --from=builder --chown=adonis:adonis /app/build ./build
COPY --from=builder --chown=adonis:adonis /app/node_modules ./node_modules
COPY --from=builder --chown=adonis:adonis /app/database ./database

USER adonis
EXPOSE 3333

# Executa migrations e inicia o servidor
ENTRYPOINT ["sh", "-c", "node build/ace.js migration:run --force || true && node build/server.js"]
