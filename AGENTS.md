# Repository Guidelines

## Active Checkout & Project Structure

The `main` checkout holds coordination files and design documentation. The runnable Next.js application is in `.worktrees/gpt-image-platform/` on branch `feature/gpt-image-platform`. Run application commands there; the outer checkout has no `package.json` or `docker-compose.yml`.

In the worktree, `src/app/` contains App Router pages and APIs, `src/components/` reusable UI, and `src/server/` auth, database, provider, job, history, storage, and worker code. Prisma files live in `prisma/`; tests are grouped under `tests/`. Track only `.gitkeep` beneath `storage/generated-images/`. Keep design, plan, review, and handoff notes in `docs/`.

## Build, Test, and Development Commands

Use PowerShell command shims from the application worktree:

```powershell
cd .worktrees/gpt-image-platform
npm.cmd ci                 # install locked dependencies
npx.cmd prisma db push     # sync a local database schema
npm.cmd run db:seed        # create/update the local admin
npm.cmd test               # run Vitest
npm.cmd run typecheck      # check strict TypeScript
npm.cmd run build          # build Next.js
npm.cmd run dev            # start the web app
npm.cmd run worker         # process queued jobs
docker compose up --build  # start the complete local stack
docker compose config      # validate Compose configuration
```

For non-Docker development, run the app and worker in separate terminals. Never use `docker compose down -v` unless deleting local database and image volumes is intentional.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, double quotes, and semicolons. Name React components in PascalCase and functions or variables in camelCase. Follow Next.js route naming and the `@/*` alias for `src/*`. Extend existing repositories, adapters, and Zod validation rather than adding one-off data or HTTP paths. No formatter or linter configuration is committed, so match nearby code.

## Testing Guidelines

Vitest runs with jsdom and globals. Name tests `*.test.ts` or `*.test.tsx` under `tests/<area>/`. Cover success and failure paths, especially auth boundaries, provider errors, worker retries, archive failures, history pagination, and UI interactions. Run focused tests, for example `npm.cmd test -- tests/ui`, before the full suite.

## Commit & Pull Request Guidelines

History uses short Conventional Commit-style messages such as `feat: add generation APIs` and `fix: stabilize Docker startup`. Pull requests should summarize behavior changes, list verification commands, link issues, and include screenshots for UI work.

## Security & Agent Notes

Never commit `.env`, API keys, generated images, or database data. `ENCRYPTION_KEY` must decode to 32 bytes; enter provider credentials through `/admin/providers`. Before editing, inspect Git status in both checkouts and preserve existing changes, especially in the modified feature worktree.
