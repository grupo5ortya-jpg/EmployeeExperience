# Build context: ./server (ver docker-compose.yml) — necesita acceso a ../bs además de backend/,
# porque connection/connection.js lee server/bs/info.conf con una ruta relativa fija
# (path.join(__dirname, '..', '..', 'bs')) para bootstrapear tipos/funciones custom de Postgres
# antes de que Sequelize sincronice los modelos.

FROM node:20-alpine

WORKDIR /app/server/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/ ./
COPY bs/ /app/server/bs

ENV NODE_ENV=production
EXPOSE 3002

CMD ["node", "index.js"]
