FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM base AS runner
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333
WORKDIR /app
RUN addgroup -S adonis && adduser -S adonis -G adonis
COPY --from=builder --chown=adonis:adonis /app/build ./build
COPY --from=builder --chown=adonis:adonis /app/node_modules ./node_modules
RUN ln -s ./build/ace.js ./ace.js
USER adonis
EXPOSE 3333
ENTRYPOINT ["sh", "-c", "node ace migration:run --force && node build/server.js"]
