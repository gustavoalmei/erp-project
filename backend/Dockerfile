FROM node:20-slim

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/prisma ./prisma
RUN npx prisma generate

COPY backend/ .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
