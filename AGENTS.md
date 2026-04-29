# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js image generation platform. App routes and pages live in `src/app`, reusable UI in `src/components`, server-side auth, provider, job, worker, and storage code in `src/server`, and Prisma models in `prisma/schema.prisma`. Tests live in `tests/` and are grouped by area, such as `tests/auth`, `tests/api`, `tests/ui`, and `tests/worker`. Generated images are stored under `storage/generated-images/`; only `.gitkeep` should be tracked.

## Build, Test, and Development Commands

Use `npm.cmd` in PowerShell.

```powershell
npm.cmd install              # install dependencies
npx.cmd prisma migrate dev   # apply local Postgres schema changes
npm.cmd run db:seed          # create/update the default local admin
npm.cmd run dev              # start the Next.js app
npm.cmd run worker           # run queued image jobs
npm.cmd test                 # run Vitest test suite
npm.cmd run typecheck        # run TypeScript checks
npm.cmd run build            # create production Next.js build
docker compose up --build    # run app, worker, and Postgres
```

## Coding Style & Naming Conventions

Write TypeScript with strict types and keep modules small. Use PascalCase for React components, camelCase for functions and variables, and kebab-case for route folders where Next.js expects them. Prefer existing server repository and adapter patterns over ad hoc database or HTTP logic.

## Testing Guidelines

Use Vitest for unit, API handler, worker, and component coverage. Put tests near their domain under `tests/<area>/*.test.ts` or `*.test.tsx`. Cover both successful generation flows and failure paths, especially provider errors, auth boundaries, and archive failures.

## Commit & Pull Request Guidelines

Current history uses short Conventional Commit-style messages, for example `feat: add generation APIs` and `fix: complete provider admin and reuse initialization`. Keep commits focused. Pull requests should include a concise summary, verification commands run, linked issues if any, and screenshots for UI changes.

## Security & Configuration Tips

Never commit `.env`, API keys, or generated images. `ENCRYPTION_KEY` must decode to 32 bytes because provider keys are encrypted with AES-256-GCM. Configure real provider credentials through `/admin/providers`, not source files.
