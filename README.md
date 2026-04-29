# GPT Image Delivery Platform

Internal MVP for chat-based image generation with configurable OpenAI-compatible providers, queued jobs, local image archiving, and a worker process.

## Stack

- Next.js, React, and TypeScript for the web app and API routes
- Prisma with Postgres for persistence
- Vitest for unit and component tests
- Docker Compose for local app, worker, and database services

## Prerequisites

- Node.js 22 or newer
- Postgres for local non-Docker development
- Docker Desktop for `docker compose` commands

## Local Setup

```powershell
cp .env.example .env
npm.cmd install
```

Edit `.env` before running the app. `ENCRYPTION_KEY` must be a base64 value that decodes to 32 bytes. Generate one in PowerShell:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Create or update the local database schema:

```powershell
npx.cmd prisma migrate dev --name init
npm.cmd run db:seed
```

Run the web app and worker in separate terminals:

```powershell
npm.cmd run dev
npm.cmd run worker
```

Open `http://localhost:3000`.

Default local admin:

```text
Account: admin@example.com
Password: admin123456
```

## Docker

```powershell
docker compose up --build
```

Compose starts Postgres, applies the Prisma schema, seeds the default admin, runs the Next.js dev server on port `3000`, and starts the background worker. For real deployments, replace the default `AUTH_SECRET`, `ENCRYPTION_KEY`, and default admin password.

## Useful Commands

```powershell
npm.cmd test              # run Vitest
npm.cmd run typecheck     # run TypeScript checks
npm.cmd run build         # build Next.js for production
npm.cmd run db:seed       # create/update the default local admin
docker compose config     # validate Compose configuration
```

## Provider Configuration

Add provider API keys through `/admin/providers`. Do not commit `.env`, real API keys, generated image files, or local database data.
