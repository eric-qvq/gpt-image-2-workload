# Repository Guidelines

## Active Checkout & Project Structure

The default `main` checkout is the runnable GPT Image Workbench application after integration. The linked worktree `.worktrees/gpt-image-platform/` remains the development checkout for branch `feature/gpt-image-platform`. When working on `main`, run application commands from the repository root; when working on the feature branch, run them from the linked worktree.

`src/app/` contains App Router pages and APIs, `src/components/` contains reusable UI, and `src/server/` contains authentication, database, provider, job, history, storage, and worker code. Prisma files live in `prisma/`; tests are grouped under `tests/`; design, plan, review, and handoff notes live in `docs/`. Track only `.gitkeep` beneath `storage/generated-images/`.

Before editing, inspect status in both checkouts and preserve existing changes:

```powershell
git status --short --branch
git -c safe.directory=U:/gpt-image-2-workload/.worktrees/gpt-image-platform -C .worktrees/gpt-image-platform status --short --branch
```

## Build, Test, and Development Commands

Use PowerShell command shims from the current application checkout:

```powershell
npm.cmd ci                 # install locked dependencies
npx.cmd prisma db push    # sync a local database schema
npm.cmd run db:seed       # create/update the local admin
npm.cmd test              # run Vitest
npm.cmd run typecheck     # check strict TypeScript
npm.cmd run build         # build Next.js
npm.cmd run dev           # start the web app
npm.cmd run worker        # process queued jobs
docker compose up --build # start the complete local stack
docker compose config     # validate Compose configuration
```

For non-Docker development, run the app and worker in separate terminals. Never use `docker compose down -v` unless deleting local database and image volumes is intentional.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, double quotes, and semicolons. Name React components in PascalCase and functions or variables in camelCase. Follow Next.js route naming and the `@/*` alias for `src/*`. Extend existing repositories, adapters, and Zod validation rather than adding one-off data or HTTP paths. No formatter or linter configuration is committed, so match nearby code.

## Testing Guidelines

Vitest runs with jsdom and globals. Name tests `*.test.ts` or `*.test.tsx` under `tests/<area>/`. Cover success and failure paths, especially auth boundaries, provider errors, worker retries, archive failures, history pagination, and UI interactions. Run focused tests, for example:

```powershell
npm.cmd test -- tests/ui
```

## Commit & Pull Request Guidelines

History uses short Conventional Commit-style messages such as `feat: add generation APIs` and `fix: stabilize Docker startup`. Keep commits focused. Pull requests should summarize behavior changes, list verification commands, link issues, and include screenshots for UI work.

## Security & Agent Notes

Never commit `.env`, API keys, generated images, database data, dependency folders, or build artifacts. `ENCRYPTION_KEY` must decode to 32 bytes because Provider keys are encrypted with AES-256-GCM. Enter real Provider credentials through `/models` as an administrator; `/admin/providers` remains a compatibility URL.

Do not use `git reset --hard`, `git clean`, force-push, or worktree removal unless the user explicitly authorizes the destructive operation. Preserve both the stable `main` checkout and the feature worktree when continuing existing work.
