FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/prisma ./prisma
RUN npx prisma generate

COPY backend/ .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
