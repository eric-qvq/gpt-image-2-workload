# Main Branch Integration and Bilingual README Design

## Status

This specification records the user-approved repository publication direction from 2026-07-24. The complete runnable GPT Image Workbench application will become visible on the GitHub default `main` branch while retaining the existing `feature/gpt-image-platform` development history.

The README will use Chinese as its primary language and provide a concise English overview. This work is a repository-publication and documentation pass. It must not change application behavior, APIs, database models, Provider adapters, job processing, image archiving, storage semantics, or authentication boundaries.

## Current Repository State

The repository uses a linked-worktree layout:

- the outer checkout is on `main` and currently contains coordination files, design documents, the reference image, and handoff material;
- the runnable Next.js application is in `.worktrees/gpt-image-platform` on `feature/gpt-image-platform`;
- `main` and `feature/gpt-image-platform` share commit `21f6599` as their merge base;
- `main` has already been pushed to `origin/main` but does not yet contain the application tree;
- the application worktree contains substantial tracked and untracked implementation work that is not represented by commit `68e8ce5` and therefore cannot be uploaded by pushing `main` alone.

The existing application README still describes the linked worktree as the only runtime location and contains an obsolete absolute path under `C:\Users\29800\Desktop`. After integration, the GitHub `main` branch will contain `docker-compose.yml`, `package.json`, `src/`, `tests/`, and the other application files at repository root, so those instructions must be replaced.

## Goals

1. Make the complete runnable application visible on the GitHub default `main` branch.
2. Preserve the existing feature-branch commit history for inspection and rollback.
3. Preserve the current outer-checkout coordination and handoff documents.
4. Publish a detailed Chinese-first bilingual README that accurately describes the implemented system.
5. Create a verified local checkpoint that the user can push to GitHub without force-pushing.
6. Keep secrets, generated images, databases, dependency folders, and build artifacts out of Git.

## Non-Goals

This pass will not:

- redesign the interface;
- add or connect preview-only product features;
- change API request or response formats;
- change Prisma models, migrations, seed behavior, or database contents;
- change Provider credentials, encryption, adapters, jobs, worker retry behavior, archive behavior, or storage paths;
- create a deployment service, hosted demo, license, release automation, or CI workflow;
- delete or recreate the linked worktree;
- use `git reset --hard`, `git clean`, force-push, or destructive Docker volume commands.

## Branch Integration Strategy

### Feature checkpoint

The application worktree remains the source of truth until its current tracked and untracked work is committed. The implementation pass will:

1. update the application README;
2. inspect all staged paths and sensitive-file exclusions;
3. run the complete automated verification gates;
4. commit the complete current application state to `feature/gpt-image-platform` as a checkpoint.

The checkpoint commit will include the existing application implementation, UI routes, localization, tests, and current design/plan documents. It will exclude `.env`, API credentials, `.next`, `node_modules`, database files, generated images other than `storage/generated-images/.gitkeep`, and other ignored runtime data.

### Main integration

After the feature checkpoint is verified, the outer checkout will merge `feature/gpt-image-platform` into `main` with a normal non-fast-forward merge. A normal merge is preferred over a squash merge because it preserves the application branch's granular history and makes earlier states directly reachable from `main`.

The merge must not replace the repository by copying files between directories. Git will integrate the branch trees using their shared merge base.

### Conflict policy

Only genuine merge conflicts will be edited. Conflict resolution follows these rules:

- `README.md`: use the new Chinese-first bilingual publication README;
- `AGENTS.md`: preserve the current repository safety rules and update only paths or commands that become inaccurate after the application is available at the `main` root;
- `.gitignore`: retain all application exclusions and the linked-worktree/local-tool exclusions needed by the current workspace;
- `CONTINUE_HERE.md`, `CLAUDE.md`, `plans.md`, `docs/project-review.md`, the reference image, and historical design documents: preserve them unless Git proves a direct conflict;
- application source, tests, Prisma, Docker, Provider, worker, archive, and storage files: take the verified feature checkpoint without opportunistic behavioral edits.

The linked worktree directory remains ignored as a local checkout. The `.worktrees/` directory itself must never be committed to GitHub.

## README Information Architecture

The merged repository root will contain one authoritative `README.md`.

### Chinese primary section

The Chinese section will contain:

1. **项目简介** — position GPT Image Workbench as a Docker-first image-generation application built with Next.js, PostgreSQL, Prisma, and a queued worker.
2. **界面预览** — embed the tracked `gpt-image-2 interface.png` through a relative Markdown path and explain that it is the visual reference for the current interface.
3. **功能状态** — distinguish connected behavior from interface-preview behavior.
4. **核心能力** — authentication and roles, Provider/Model administration, generation jobs, worker polling and retries, archiving, History, Download, Reuse, and persistent English/Chinese selection.
5. **技术栈** — list Next.js 15, React 19, strict TypeScript, Prisma 6, PostgreSQL, Vitest, Docker Compose, and OpenAI-compatible image providers.
6. **系统流程** — describe browser to Next.js to PostgreSQL queue to worker to Provider API to local archive and History.
7. **页面路由** — document `/`, `/generate`, `/history`, `/models`, `/batch-jobs`, `/dataset`, `/api-keys`, `/usage`, `/settings`, `/login`, and the compatibility route `/admin/providers`.
8. **Docker 快速开始** — run Compose from repository root and open `http://localhost:3000`.
9. **首次 Provider 配置** — document the default local admin, Provider base URL, `/v1` requirement, API key entry, model registration, generation, and History verification.
10. **非 Docker 开发** — install locked dependencies, synchronize Prisma, seed the admin, and run the app and worker in separate PowerShell terminals.
11. **环境变量与安全** — explain the important variables and the 32-byte decoded requirement for `ENCRYPTION_KEY` without publishing real secrets.
12. **数据持久化** — explain the PostgreSQL, generated-image, and container dependency named volumes and warn against `docker compose down -v`.
13. **测试与构建** — provide focused tests, full tests, typecheck, build, and Compose configuration commands.
14. **项目结构** — summarize `src/app`, `src/components`, `src/server`, `prisma`, `tests`, `docs`, and `storage/generated-images`.
15. **Git 分支与回滚** — describe `main`, `feature/gpt-image-platform`, checkpoint tags, and safe history inspection or revert-based recovery.
16. **常见问题** — cover missing Compose configuration, Docker Desktop readiness, missing Provider/Model configuration, HTML upstream responses, encryption-key validation, and idle workers.
17. **安全说明与项目状态** — state that preview-only features are intentionally not connected and that real secrets or generated content must not be committed.

### English overview

The English section will be self-contained but shorter. It will include:

- project purpose;
- implemented capabilities and preview-only boundaries;
- Docker quick start;
- first Provider setup;
- local development and verification commands;
- security and data-persistence warnings;
- current project status.

The README will not claim a hosted demo, production readiness, a license, real billing or quota support, real API key management, real dataset upload, real batch processing, or usage metering.

## Runtime Instructions After Integration

The primary GitHub quick start will be:

```powershell
git clone git@github.com:eric-qvq/gpt-image-2-workload.git
Set-Location "gpt-image-2-workload"
docker compose up --build
```

The application will be available at `http://localhost:3000`. The README may also show the HTTPS clone URL as an alternative, but it will not contain machine-specific absolute paths.

For non-Docker development, PowerShell command shims remain authoritative:

```powershell
npm.cmd ci
npx.cmd prisma db push
npm.cmd run db:seed
npm.cmd run dev
npm.cmd run worker
```

The app and worker must run in separate terminals outside Docker.

## Verification Strategy

### Before the feature checkpoint

Run from `.worktrees/gpt-image-platform`:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
docker compose config --quiet
```

Inspect:

```powershell
git status --short --branch
git diff --check
git diff --cached --name-only
git status --ignored --short
```

No secret, generated image, database, dependency, or build-artifact path may be staged.

### After merging into main

Run the same test, typecheck, build, and Compose gates from the outer repository root. Also verify:

- `package.json`, `docker-compose.yml`, `src/`, `prisma/`, `tests/`, and the bilingual `README.md` are tracked on `main`;
- `git status --short --branch` is clean after the merge commit;
- no staged files remain;
- `git log --graph --oneline --decorate --all` shows the feature history connected to `main`;
- the local remote remains `origin` at the user's GitHub repository;
- no push has been performed by the implementation pass.

If an automated gate fails, stop the integration, diagnose the failure, and preserve the current state. Do not continue to the merge while verification is failing.

## Delivery and User Push Commands

The implementation pass will create local commits and, if verification succeeds, a local annotated checkpoint tag. It will not push external state. The final handoff will provide commands equivalent to:

```powershell
git push -u origin feature/gpt-image-platform
git push origin main
git push origin checkpoint-2026-07-24
```

The exact checkpoint tag name and final commit identifiers will be reported from fresh Git output; if the date changes before implementation, the tag will use the actual checkpoint date.

## Acceptance Criteria

- The complete runnable application exists at the root of local `main`.
- Git history from `feature/gpt-image-platform` remains reachable from `main`.
- The outer coordination and handoff artifacts remain present.
- The root README is detailed, Chinese-first, and includes a usable English overview.
- README commands work from the merged repository root and contain no obsolete machine-specific path.
- Connected and preview-only functionality are described truthfully.
- No `.env`, credentials, generated images, databases, dependencies, or build artifacts are committed.
- Full tests, typecheck, production build, and Compose configuration pass before and after the merge.
- No destructive Git or Docker-volume command is used.
- No remote push is performed; the user receives exact push commands after local verification.
