# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal team platform for configurable image generation. Admins configure providers (OpenAI, OpenAI-compatible, or custom HTTP endpoints) with API keys, base URLs, and models. Members use a chat-first interface with a parameter panel to generate, archive, and download images.

**Status:** Early MVP. Main branch has design docs and plan only. Implementation lives in a worktree at `.worktrees/gpt-image-platform/` (branch `gpt-image-platform`).

## Tech Stack

- **Web/API:** Next.js 15, TypeScript, React 19, App Router
- **Database:** Prisma 6 + PostgreSQL
- **Auth:** bcryptjs (passwords) + jose (JWT sessions)
- **Validation:** Zod
- **Testing:** Vitest + jsdom + Testing Library
- **Worker:** Standalone Node process polling Postgres for queued generation jobs
- **Deployment:** Docker Compose (app, worker, postgres, storage volume)

## Commands

```sh
npm install                          # install dependencies
npm run dev                          # start Next.js dev server
npm run build                        # production build
npm run worker                       # start generation job worker (tsx src/server/worker/main.ts)
npm run typecheck                    # tsc --noEmit
npm test                             # vitest run (all tests)
npm test -- tests/auth               # run a specific test directory
npm test -- tests/auth/password.test.ts  # run a single test file
npm run test:watch                   # vitest in watch mode
npx prisma validate                  # validate schema
npx prisma migrate dev               # apply migrations locally
npx prisma generate                  # regenerate Prisma client
docker compose up --build            # run full stack
```

## Architecture

```
src/
  app/                    # Next.js App Router pages and API routes
    api/
      admin/providers/    # Provider CRUD (admin-only)
      conversations/      # Create conversations, submit prompts
      generation-jobs/    # Job status polling
      history/            # User's image history
    login/                # Login page
    generate/             # Main generation UI (chat + parameter panel)
    history/              # Image history browser
    admin/providers/      # Admin provider config page
  components/
    chat/                 # GenerationChat — chat stream with image results
    settings/             # ParameterPanel — provider/model/size/count controls
    admin/                # ProviderForm — admin provider management
    assets/               # ImageGrid — image history display
  server/
    auth/                 # password.ts, session.ts (JWT), guards.ts (role checks)
    db/                   # Prisma client singleton
    providers/
      encryption.ts       # AES-256-GCM for API key storage
      repository.ts       # Provider/model CRUD with Zod validation
      adapters/           # Provider adapters (openai-compatible, registry, types)
    jobs/                 # Generation job repository (create, claim, status transitions)
    storage/              # Local file storage adapter + image archive service
    worker/               # Polling worker loop + single job processor
prisma/
  schema.prisma           # 7 models: User, Provider, ImageModel, Conversation,
                          #   Message, GenerationJob, ImageAsset
tests/                    # Mirrors src structure: auth/, db/, providers/, jobs/,
                          #   storage/, worker/, api/, ui/
storage/generated-images/ # Local image archive (Docker volume in production)
```

## Key Design Decisions

- **Provider adapters:** All image providers go through a unified adapter interface (`src/server/providers/adapters/types.ts`). Model names are configurable, never hard-coded.
- **Job flow:** `QUEUED -> RUNNING -> SUCCEEDED -> ARCHIVED` (or `FAILED`/`ARCHIVE_FAILED`). Worker claims jobs via Postgres polling (no Redis in MVP).
- **API key encryption:** AES-256-GCM with `ENCRYPTION_KEY` env var. Keys are encrypted before storage and never returned in list responses.
- **Auth:** JWT sessions with `AUTH_SECRET`, 7-day expiry. Two roles: `ADMIN` and `MEMBER`.
- **Storage adapter:** Local filesystem now, designed to swap for S3/R2/OSS later via the storage interface in `src/server/storage/types.ts`.
- **Path alias:** `@/*` maps to `src/*` in tsconfig.

## Environment Variables

See `.env.example`. Required: `DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_KEY`, `STORAGE_ROOT`, `WORKER_POLL_INTERVAL_MS`.

## Testing Conventions

- Tests live in `tests/` mirroring `src/` structure
- Vitest with jsdom environment and globals enabled
- UI tests use `@testing-library/react`
- Provider adapter tests mock `global.fetch`
- Storage tests use temporary directories
