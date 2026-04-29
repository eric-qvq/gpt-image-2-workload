FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/gpt_image_platform
ENV AUTH_SECRET=change-this-secret-before-production
ENV ENCRYPTION_KEY=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=
ENV STORAGE_ROOT=storage/generated-images
ENV WORKER_POLL_INTERVAL_MS=2000

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
