# GPT Image Delivery Platform - Project Review Report

> Generated: 2026-04-29
> Reviewer scope: design spec, implementation plan, all source code in worktree `gpt-image-platform`

---

## 1. Project Overview

| Item | Status |
|------|--------|
| Design Spec | docs/superpowers/specs/2026-04-27-gpt-image-delivery-platform-design.md |
| Implementation Plan | docs/superpowers/plans/2026-04-27-gpt-image-delivery-platform.md |
| Source Code | .worktrees/gpt-image-platform/ (NOT merged to main branch) |
| Main Branch | Only contains README.md, AGENTS.md, design docs, storage/.gitkeep |

**Key Finding: All implementation code lives in a git worktree (`.worktrees/gpt-image-platform/`), and has NOT been merged into the main branch.** The main branch root is essentially empty — no source code, no package.json, no Prisma schema.

---

## 2. Plan vs Implementation Checklist

### Task 1: Project Scaffold

| Step | Plan | Implementation | Status |
|------|------|---------------|--------|
| package.json | Next.js 15 + React 19 + Prisma 6 + bcryptjs + jose + zod | Matches exactly | OK |
| tsconfig.json | strict, bundler resolution, @/* path alias | Matches | OK |
| next.config.mjs | Empty config object | Matches | OK |
| vitest.config.ts | jsdom, globals, tests/**/*.test.* | Matches | OK |
| .env.example | 5 vars: DATABASE_URL, AUTH_SECRET, ENCRYPTION_KEY, STORAGE_ROOT, WORKER_POLL_INTERVAL_MS | Matches | OK |
| .gitignore | .env, .next/, node_modules/, coverage/, storage/generated-images/*, .superpowers/, .worktrees/ | Matches | OK |
| layout.tsx | Metadata + RootLayout | Matches | OK |
| page.tsx | Nav links to /login, /generate, /history, /admin/providers | Matches | OK |

### Task 2: Prisma Schema and DB Client

| Item | Plan | Implementation | Status |
|------|------|---------------|--------|
| Enums: Role, UserStatus, ProviderType, JobStatus, MessageRole | Required | All present | OK |
| Model: User | account, passwordHash, role, status | Has `email` field (extra, not in design spec) | EXTRA |
| Model: Provider | name, type, baseUrl, encryptedApiKey, enabled | Matches | OK |
| Model: ImageModel | providerId, name, defaultParams (Json), capabilities (Json), enabled | Matches + `@@unique([providerId, name])` | OK |
| Model: Conversation | userId, title | Matches + `@@index([userId])` | OK |
| Model: Message | conversationId, role, content, generationJobId | Matches + bidirectional job relations | OK |
| Model: GenerationJob | complex fields | Has `userId` + `prompt` (prompt stored at top level, not just in requestParams) | OK (good choice) |
| Model: ImageAsset | jobId, upstreamUrl, localPath, fileSize, width, height, mimeType | Matches + `@@index([jobId])` | OK |
| Indexes | status, createdAt on GenerationJob, userId on Conversation, jobId on ImageAsset | All present | OK |
| DB Client singleton | globalThis pattern, dev logging | Matches plan exactly | OK |

### Task 3: Auth, Passwords, and Roles

| Item | Plan | Implementation | Status |
|------|------|---------------|--------|
| password.ts | bcryptjs hash/verify, cost=12 | Matches | OK |
| session.ts | jose SignJWT/jwtVerify, HS256, 7-day, AUTH_SECRET | Matches, clean payload parsing | OK |
| guards.ts | requireAdmin, requireMember throwing Response | Matches. requireMember allows ADMIN too | OK |

### Task 4: Provider and Model Configuration

| Item | Plan | Implementation | Status |
|------|------|---------------|--------|
| encryption.ts | AES-256-GCM, iv.authTag.ciphertext base64, 32-byte ENCRYPTION_KEY | Matches | OK |
| repository.ts | zod validation, createProvider, listProviders, createModel, listModelsForProvider | Matches, never returns decrypted keys in list | OK |
| API: GET/POST /api/admin/providers | Admin-only, cookie-based session | Matches | OK |
| API: GET/POST /api/admin/providers/[providerId]/models | Admin-only | Matches | OK |

### Task 5: Generation Job Domain and Provider Adapters

| Item | Plan | Implementation | Status |
|------|------|---------------|--------|
| jobs/types.ts | GenerationJobInput type | Matches | OK |
| jobs/repository.ts | createGenerationJob, claimNextJob (transaction), markJobSucceeded/Failed/Archived | Matches | OK |
| adapters/types.ts | ImageGenerationRequest, GeneratedImage, adapter function type | Matches | OK |
| adapters/openai-compatible.ts | Authorization: Bearer, POST /images/generations, normalizes data[] | Matches, has ProviderRequestError class | OK |
| adapters/registry.ts | Maps OPENAI_OFFICIAL, OPENAI_COMPATIBLE, CUSTOM_HTTP | All use same adapter for MVP | OK |

### Task 6: Local Storage and Image Archiving

| Item | Plan | Implementation | Status |
|------|------|---------------|--------|
| storage/types.ts | SaveImageInput, SaveImageResult, StorageAdapter | Matches | OK |
| storage/local.ts | LocalStorageAdapter, recursive mkdir, `<jobId>/<index>.<ext>` | Matches | OK |
| storage/archive.ts | archiveGeneratedImages, handles URL download + base64, records ImageAsset | Matches, partial success logic correct | OK |

### Task 7: Worker Loop

| Item | Plan | Implementation | Status |
|------|------|---------------|--------|
| worker/process-job.ts | Load job, decrypt key, call adapter, mark succeeded, archive, handle failure | Matches, clean DI pattern | OK |
| worker/main.ts | Polling loop, WORKER_POLL_INTERVAL_MS, error logging | Matches | OK |
| Entry point | `require.main === module` guard | Present | OK |

### Task 8: Conversations, Jobs, and History APIs

| Item | Plan | Implementation | Status |
|------|------|---------------|--------|
| POST /api/conversations | Create conversation with title | Matches, defaults "Untitled conversation" | OK |
| POST /api/conversations/[id]/messages | Create message + queued job in transaction | Matches, validates prompt/providerId/modelId | OK |
| GET /api/generation-jobs/[jobId] | Status, errors, imageAssets; owner or admin | Matches | OK |
| GET /api/history | Member's image assets with job/model details | Matches | OK |
| Missing: GET /api/conversations | List user's conversations | NOT IMPLEMENTED | MISSING |

### Task 9: MVP User Interface

| Item | Plan | Implementation | Status |
|------|------|---------------|--------|
| Login page | Form with account + password | UI-only, NO form action/submit handler | INCOMPLETE |
| Generate page | Chat + parameter panel | Present but uses hardcoded mock data, no real API calls | INCOMPLETE |
| History page | Filterable grid with download/reuse | Present but uses hardcoded mock data, no real API fetch | INCOMPLETE |
| Admin providers page | List + add form | Calls server `listProviders()` directly (SSR) + client ProviderForm | PARTIAL |
| GenerationChat.tsx | Chat stream with prompt/status/images | Renders correctly, accepts onSubmit | OK (component) |
| ParameterPanel.tsx | Provider/model/size/count/quality controls | Renders correctly, calls onChange | OK (component) |
| ProviderForm.tsx | Admin form for adding providers | Calls real API, handles model creation | OK |
| ImageGrid.tsx | Grid with download + reuse links | Renders correctly, builds reuse URLs | OK (component) |

### Task 10: Docker Deployment

| Item | Plan | Implementation | Status |
|------|------|---------------|--------|
| Dockerfile | Node 22, npm ci, prisma generate, next build | Present, uses mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm | OK |
| docker-compose.yml | postgres, app, worker, volumes | Enhanced: has `migrate` service, healthcheck, `prisma db push` | BETTER |
| README.md | Setup/run commands | Present, PowerShell-specific commands | OK |
| AGENTS.md | Concrete commands | Updated with project-specific guidelines | OK |

---

## 3. Issues Found

### CRITICAL

| # | Issue | Location | Details |
|---|-------|----------|---------|
| C1 | Code not on main branch | Repo root | All implementation is in `.worktrees/gpt-image-platform/`, not merged to main. The main branch has no source code. |
| C2 | Dockerfile contains hardcoded secrets | Dockerfile:7-8 | `AUTH_SECRET=change-this-secret-before-production` and `ENCRYPTION_KEY=MDEy...` are baked into the image. These should only be set via runtime env vars or docker-compose, never in the image layer. |

### HIGH

| # | Issue | Location | Details |
|---|-------|----------|---------|
| H1 | Login page has no functionality | src/app/login/page.tsx | The form has no `action`, no `onSubmit`, no API call. Users cannot actually log in. There is also no `/api/auth/login` route. |
| H2 | Generate page uses hardcoded mock data | src/app/generate/page.tsx:15-16 | `providers` and `models` are hardcoded arrays, not fetched from the API. The `handleSubmit` only appends local messages, does not call `/api/conversations` or create real jobs. |
| H3 | History page uses hardcoded mock data | src/app/history/page.tsx:3-18 | `assets` array is hardcoded with a placeholder image. Does not fetch from `/api/history`. |
| H4 | No user seed/creation mechanism | Prisma schema | No `/api/auth/register` or seed script exists. There is no way to create the first admin user. |
| H5 | Worker uses `console.error` | src/server/worker/main.ts:34 | Per coding standards, production code should not use `console.log`/`console.error`. Should use a proper logger. |
| H6 | Worker uses `require.main === module` | src/server/worker/main.ts:41 | This is a CommonJS pattern but the project uses ESM (`"module": "esnext"` in tsconfig). With `tsx` runner this works, but it's fragile. |

### MEDIUM

| # | Issue | Location | Details |
|---|-------|----------|---------|
| M1 | Session extraction duplicated across every route | All API routes | `requireSession(request)` with cookie parsing is copy-pasted in 6 files. Should be a shared middleware or utility. |
| M2 | No CSRF protection on forms | Login, ProviderForm | Forms submit POST requests without CSRF tokens. |
| M3 | Admin providers page calls `listProviders()` in SSR without auth | src/app/admin/providers/page.tsx:7 | The server component calls `listProviders()` directly. There's no auth check — any visitor can see the providers page via SSR. The `.catch(() => [])` silently swallows DB errors. |
| M4 | `GET /api/conversations` not implemented | API routes | The plan includes conversation listing, but only POST is implemented. Users cannot see their conversation list. |
| M5 | No pagination on list endpoints | /api/history, /api/admin/providers | All queries use `findMany()` without `take`/`skip`. Will degrade with volume. |
| M6 | User `email` field in schema not in design spec | prisma/schema.prisma:45 | The design spec defines User as `account, password hash, role, status`. The schema adds `email` with `@unique`. This is fine but should be documented. |
| M7 | `claimNextJob` has no row-level locking | src/server/jobs/repository.ts:60-74 | The transaction uses `findFirst` + `update`, but without `SELECT ... FOR UPDATE`, two concurrent workers could claim the same job. Prisma doesn't support `FOR UPDATE` natively — needs raw SQL or an alternative approach. |
| M8 | No retry logic for failed jobs | Worker | Failed jobs stay in `FAILED` status permanently. No retry mechanism or `retryCount` usage despite the field existing in the schema. |

### LOW

| # | Issue | Location | Details |
|---|-------|----------|---------|
| L1 | `ProviderForm` uses `window.location.reload()` | src/components/admin/ProviderForm.tsx:59 | Full page reload after saving. Should use React state update or router refresh. |
| L2 | Unused `React` import | GenerationChat.tsx:3, ParameterPanel.tsx:3 | `import React from "react"` is not needed with React 19 JSX transform. |
| L3 | No `output_format` parameter support | ParameterPanel, adapter | The design mentions "output format" but the parameter panel doesn't include it, and the adapter type uses `responseFormat` which maps to `response_format` not `output_format`. |
| L4 | `extensionFromContentType` is incomplete | src/server/storage/archive.ts:62-67 | Only handles jpeg, webp, gif. Falls through to png for everything else, including avif or svg. |
| L5 | No image serving route | API routes | Archived images are saved to local filesystem but there's no API route or static file serving configured to display them in the browser. |

---

## 4. Architecture Assessment

### What's done well

1. **Clean separation of concerns**: Server logic is organized into `auth/`, `providers/`, `jobs/`, `storage/`, `worker/` domains.
2. **Dependency injection pattern**: Repositories and services accept optional `context` objects for testing, avoiding hard Prisma coupling.
3. **API key encryption**: AES-256-GCM with proper IV + auth tag. Never returns decrypted keys from list endpoints.
4. **Provider adapter pattern**: Extensible registry with normalized types. Easy to add new provider types.
5. **Docker Compose**: Includes a `migrate` service with healthcheck dependency, which is better than the original plan.
6. **Zod validation**: Input validation on provider/model creation at the server boundary.

### What needs work

1. **Auth flow is incomplete**: No login API, no session cookie setting, no logout, no user creation.
2. **Frontend is shell-only**: Pages render but don't connect to backend APIs. The generate and history pages use hardcoded mock data.
3. **No real-time job status**: The design mentions "UI displays results as soon as available" but there's no polling or SSE/WebSocket mechanism.
4. **Worker concurrency safety**: `claimNextJob` lacks row-level locking for multi-worker scenarios.
5. **No image serving**: Generated images are saved but can't be viewed through the app.

---

## 5. File Inventory

### Source Files (32 files)

```
src/app/layout.tsx                                    - App shell
src/app/page.tsx                                      - Dashboard home
src/app/login/page.tsx                                - Login (UI only, no logic)
src/app/generate/page.tsx                             - Generate page (mock data)
src/app/history/page.tsx                              - History page (mock data)
src/app/admin/providers/page.tsx                      - Provider admin (SSR, partial)
src/app/api/admin/providers/route.ts                  - Admin provider CRUD
src/app/api/admin/providers/[providerId]/models/route.ts - Admin model CRUD
src/app/api/conversations/route.ts                    - Create conversation
src/app/api/conversations/[conversationId]/messages/route.ts - Submit generation request
src/app/api/generation-jobs/[jobId]/route.ts          - Job status + assets
src/app/api/history/route.ts                          - User image history
src/components/chat/GenerationChat.tsx                 - Chat component
src/components/settings/ParameterPanel.tsx             - Parameter panel component
src/components/admin/ProviderForm.tsx                  - Provider form component
src/components/assets/ImageGrid.tsx                    - Image grid component
src/server/auth/password.ts                            - Password hashing
src/server/auth/session.ts                             - JWT session
src/server/auth/guards.ts                              - Role guards
src/server/db/client.ts                                - Prisma singleton
src/server/providers/encryption.ts                     - AES-256-GCM key encryption
src/server/providers/repository.ts                     - Provider/model repository
src/server/providers/adapters/types.ts                 - Adapter type definitions
src/server/providers/adapters/openai-compatible.ts     - OpenAI-compatible adapter
src/server/providers/adapters/registry.ts              - Adapter registry
src/server/jobs/types.ts                               - Job input types
src/server/jobs/repository.ts                          - Job repository
src/server/storage/types.ts                            - Storage adapter types
src/server/storage/local.ts                            - Local filesystem adapter
src/server/storage/archive.ts                          - Image archive service
src/server/worker/main.ts                              - Worker polling loop
src/server/worker/process-job.ts                       - Job processor
```

### Test Files (14 files)

```
tests/db/schema-shape.test.ts
tests/auth/password.test.ts
tests/auth/session.test.ts
tests/providers/encryption.test.ts
tests/providers/repository.test.ts
tests/providers/openai-compatible.test.ts
tests/jobs/repository.test.ts
tests/storage/local.test.ts
tests/storage/archive.test.ts
tests/worker/process-job.test.ts
tests/api/conversations.test.ts
tests/api/history.test.ts
tests/ui/GenerationChat.test.tsx
tests/ui/ParameterPanel.test.tsx
```

### Config/Infra Files

```
package.json, tsconfig.json, next.config.mjs, vitest.config.ts
.env.example, .gitignore, .dockerignore
Dockerfile, docker-compose.yml
prisma/schema.prisma
README.md, AGENTS.md
```

---

## 6. Recommended Next Steps (Priority Order)

### Phase 1: Make Auth Work (blocking everything else)

1. Create `POST /api/auth/login` route that validates credentials, sets session cookie
2. Create `POST /api/auth/logout` route that clears session cookie
3. Create a seed script or `POST /api/auth/register` (admin-only after first user) to bootstrap the first admin user
4. Make the login page form actually submit to the login API
5. Add auth middleware/wrapper to eliminate session-parsing duplication

### Phase 2: Connect Frontend to Backend

6. Generate page: fetch providers/models from API, call conversation/message API on submit, poll job status
7. History page: fetch from `/api/history` instead of hardcoded data
8. Add an image serving route (`/api/images/[assetId]`) or configure Next.js static file serving for the storage directory
9. Add `GET /api/conversations` to list user conversations

### Phase 3: Production Readiness

10. Remove hardcoded secrets from Dockerfile
11. Add row-level locking to `claimNextJob` (raw SQL `SELECT ... FOR UPDATE SKIP LOCKED`)
12. Add retry logic for failed jobs
13. Add pagination to list endpoints
14. Add CSRF protection
15. Extract session parsing into a shared middleware
16. Merge worktree code into main branch

---

## 7. Summary

The **backend server logic** (auth primitives, encryption, provider adapters, job processing, storage archiving, worker loop) is **well-structured and largely complete**. The code follows clean patterns with dependency injection, zod validation, and proper separation of concerns.

The **frontend** is **shell-level only** — components exist and render correctly, but pages use hardcoded mock data and the login flow is non-functional. None of the pages connect to the backend APIs.

The **critical blocker** is that the auth flow (login/register/session cookie) doesn't exist yet, which means no part of the system can be used end-to-end. Once auth is wired up and the frontend pages fetch real data, the MVP would be functional for internal team use.

All code currently lives in the worktree and needs to be merged to the main branch.
