# Build context: ./server/frontend (ver docker-compose.yml)

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Vite "bakea" las env vars VITE_* en el bundle al momento del build, no en runtime — por eso
# se pasa como build arg (docker-compose.yml) en vez de como variable de entorno del container.
ARG VITE_API_URL=http://localhost:3002
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
