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
RUN npm run build
# mantém dev-deps no builder para ace funcionar
RUN npm prune --omit=dev

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# cria user não-root
RUN addgroup -S adonis && adduser -S adonis -G adonis

# copia apenas o necessário
COPY --from=builder --chown=adonis:adonis /app/build ./build
COPY --from=builder --chown=adonis:adonis /app/node_modules ./node_modules

USER adonis
EXPOSE 3333

# IMPORTANTE: APENAS INICIA O SERVIDOR
CMD ["node", "build/server.js"]
