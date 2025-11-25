ARG CACHEBUST=1
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
WORKDIR /app

# Copia tudo do projeto para o builder
COPY . .

# Garante que migrations e seeders existam no build final
COPY database ./database

# Compila o Adonis para produção (gera a pasta build/)
RUN npm run build

# Remove dependências de dev após o build
RUN npm prune --omit=dev

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S adonis && adduser -S adonis -G adonis

# Copia build e node_modules já preparados
COPY --from=builder --chown=adonis:adonis /app/build ./build
COPY --from=builder --chown=adonis:adonis /app/node_modules ./node_modules

# Copia migrations e seeders para o container
COPY --from=builder --chown=adonis:adonis /app/database ./database

USER adonis
EXPOSE 3333

# Executa migrations de forma segura e inicia o server
ENTRYPOINT ["sh", "-c", "node build/ace.js migration:run --force && node build/ace.js migration:run --force && node build/server.js"]
