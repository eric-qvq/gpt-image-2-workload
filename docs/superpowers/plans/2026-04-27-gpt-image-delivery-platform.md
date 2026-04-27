# GPT Image Delivery Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first internal-team MVP for configurable chat-based image generation with provider settings, job processing, local image archiving, and Docker deployment.

**Architecture:** Start from the empty repository and scaffold a Next.js TypeScript app with API routes, Prisma/Postgres persistence, a separate worker entry point, and local file storage. The worker polls Postgres for queued jobs, calls provider adapters, records upstream results, and archives generated images to a Docker volume.

**Tech Stack:** Next.js, TypeScript, React, Prisma, Postgres, Vitest, Docker Compose, Node `fetch`, local filesystem storage.

---

## File Map

- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `vitest.config.ts`, `.env.example`, `.gitignore`, `Dockerfile`, `docker-compose.yml`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/admin/providers/page.tsx`, `src/app/generate/page.tsx`, `src/app/history/page.tsx`, `src/app/api/**/route.ts`
- Create: `src/components/chat/GenerationChat.tsx`, `src/components/settings/ParameterPanel.tsx`, `src/components/admin/ProviderForm.tsx`, `src/components/assets/ImageGrid.tsx`
- Create: `src/server/db/client.ts`, `src/server/auth/*`, `src/server/providers/*`, `src/server/jobs/*`, `src/server/storage/*`, `src/server/worker/main.ts`
- Create: `prisma/schema.prisma`, `tests/**/*.test.ts`, `storage/generated-images/.gitkeep`
- Modify: `README.md`, `AGENTS.md` only when commands or structure become concrete

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `vitest.config.ts`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Add package metadata and scripts**

Create `package.json`:

```json
{
  "name": "gpt-image-2-workload",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "worker": "tsx src/server/worker/main.ts",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.9.6",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.0",
    "prisma": "^6.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Add TypeScript and Vitest config**

Create `tsconfig.json` with `strict: true`, `moduleResolution: "bundler"`, and path alias `@/*` to `src/*`. Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]
  }
});
```

- [ ] **Step 3: Add environment and ignore rules**

Create `.env.example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gpt_image_platform
AUTH_SECRET=replace-with-32-byte-random-string
ENCRYPTION_KEY=replace-with-32-byte-base64-key
STORAGE_ROOT=storage/generated-images
WORKER_POLL_INTERVAL_MS=2000
```

Create `.gitignore` with `.env`, `.next/`, `node_modules/`, `coverage/`, `storage/generated-images/*`, and `.superpowers/`. Keep `storage/generated-images/.gitkeep` tracked.

- [ ] **Step 4: Add minimal app shell**

Create `src/app/layout.tsx` and `src/app/page.tsx` with a plain internal dashboard entry point linking to `/login`, `/generate`, `/history`, and `/admin/providers`.

- [ ] **Step 5: Install dependencies and verify scaffold**

Run: `npm install`

Run: `npm run typecheck`

Expected: TypeScript exits with code 0.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs vitest.config.ts .env.example .gitignore src/app
git commit -m "chore: scaffold Next.js image platform"
```

## Task 2: Prisma Schema and Database Client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/server/db/client.ts`
- Create: `tests/db/schema-shape.test.ts`

- [ ] **Step 1: Write schema shape test**

Create `tests/db/schema-shape.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Prisma schema", () => {
  it("defines the MVP persistence models", () => {
    const schema = readFileSync("prisma/schema.prisma", "utf8");
    for (const model of ["User", "Provider", "ImageModel", "Conversation", "Message", "GenerationJob", "ImageAsset"]) {
      expect(schema).toContain(`model ${model}`);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/db/schema-shape.test.ts`

Expected: FAIL because `prisma/schema.prisma` does not exist.

- [ ] **Step 3: Add Prisma schema**

Create `prisma/schema.prisma` with enums `Role`, `UserStatus`, `ProviderType`, `JobStatus`, `MessageRole` and models matching the design. Use `Json` columns for `defaultParams`, `capabilities`, `requestParams`, and `upstreamResponse`. Add indexes on `GenerationJob.status`, `GenerationJob.createdAt`, `Conversation.userId`, and `ImageAsset.jobId`.

- [ ] **Step 4: Add Prisma client singleton**

Create `src/server/db/client.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 5: Verify schema and tests**

Run: `npx prisma validate`

Expected: schema is valid.

Run: `npm test -- tests/db/schema-shape.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma src/server/db/client.ts tests/db/schema-shape.test.ts
git commit -m "feat: add database schema"
```

## Task 3: Auth, Passwords, and Roles

**Files:**
- Create: `src/server/auth/password.ts`
- Create: `src/server/auth/session.ts`
- Create: `src/server/auth/guards.ts`
- Create: `tests/auth/password.test.ts`
- Create: `tests/auth/session.test.ts`

- [ ] **Step 1: Write password tests**

Create tests proving `hashPassword("secret")` does not equal the input and `verifyPassword("secret", hash)` returns true while the wrong password returns false.

- [ ] **Step 2: Implement password utilities**

Create `src/server/auth/password.ts`:

```ts
import bcrypt from "bcryptjs";

const COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

- [ ] **Step 3: Write session tests**

Test that `createSessionToken({ userId, role })` can be verified and that tampered tokens are rejected.

- [ ] **Step 4: Implement JWT session utilities**

Create `src/server/auth/session.ts` using `jose` `SignJWT` and `jwtVerify`. Use `AUTH_SECRET` as a UTF-8 secret and include `userId`, `role`, and 7-day expiration.

- [ ] **Step 5: Add role guard helpers**

Create `src/server/auth/guards.ts` with `requireAdmin(session)` and `requireMember(session)` functions that throw `Response` objects with 401 or 403 status.

- [ ] **Step 6: Verify**

Run: `npm test -- tests/auth`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/server/auth tests/auth
git commit -m "feat: add auth primitives"
```

## Task 4: Provider and Model Configuration

**Files:**
- Create: `src/server/providers/encryption.ts`
- Create: `src/server/providers/repository.ts`
- Create: `src/app/api/admin/providers/route.ts`
- Create: `src/app/api/admin/providers/[providerId]/models/route.ts`
- Create: `tests/providers/encryption.test.ts`
- Create: `tests/providers/repository.test.ts`

- [ ] **Step 1: Write encryption tests**

Test that encrypting an API key returns a different value and decrypting it returns the original.

- [ ] **Step 2: Implement key encryption**

Create AES-256-GCM helpers in `src/server/providers/encryption.ts`. Require `ENCRYPTION_KEY` as base64 for a 32-byte key. Store output as `iv.authTag.ciphertext` base64 segments.

- [ ] **Step 3: Write repository tests with Prisma**

Test `createProvider`, `listProviders`, `createModel`, and `listModelsForProvider`. Use test records with provider type `OPENAI_COMPATIBLE` and model name `gpt-image-2`.

- [ ] **Step 4: Implement provider repository**

Create functions that validate input with `zod`, encrypt API keys before persistence, and never return decrypted keys from list responses.

- [ ] **Step 5: Add admin API routes**

Implement `POST /api/admin/providers`, `GET /api/admin/providers`, `POST /api/admin/providers/[providerId]/models`, and `GET /api/admin/providers/[providerId]/models`. Require admin role for every route.

- [ ] **Step 6: Verify**

Run: `npm test -- tests/providers`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/server/providers src/app/api/admin/providers tests/providers
git commit -m "feat: add provider configuration"
```

## Task 5: Generation Job Domain and Provider Adapters

**Files:**
- Create: `src/server/jobs/types.ts`
- Create: `src/server/jobs/repository.ts`
- Create: `src/server/providers/adapters/types.ts`
- Create: `src/server/providers/adapters/openai-compatible.ts`
- Create: `src/server/providers/adapters/registry.ts`
- Create: `tests/jobs/repository.test.ts`
- Create: `tests/providers/openai-compatible.test.ts`

- [ ] **Step 1: Write job repository tests**

Test creating a queued job with `conversationId`, `messageId`, `providerId`, `modelId`, and request params. Test claiming the oldest queued job changes status to `running`.

- [ ] **Step 2: Implement job repository**

Create `createGenerationJob`, `claimNextJob`, `markJobSucceeded`, `markJobFailed`, and `markJobArchived`. Use Prisma transactions for claim and status updates.

- [ ] **Step 3: Write adapter tests**

Mock `global.fetch`. Verify the OpenAI-compatible adapter sends `Authorization: Bearer <key>`, posts to `${baseUrl}/images/generations`, includes the configured model name, and normalizes both URL and base64 image responses.

- [ ] **Step 4: Implement adapter types**

Define:

```ts
export type ImageGenerationRequest = {
  prompt: string;
  model: string;
  size?: string;
  quality?: string;
  count?: number;
  responseFormat?: "url" | "b64_json";
};

export type GeneratedImage = {
  upstreamUrl?: string;
  b64Json?: string;
  revisedPrompt?: string;
};
```

- [ ] **Step 5: Implement OpenAI-compatible adapter**

Create a class or function that accepts `baseUrl`, decrypted API key, and request params. Trim trailing slashes from `baseUrl`, POST JSON, throw a structured error on non-2xx responses, and normalize `data[]` into `GeneratedImage[]`.

- [ ] **Step 6: Add adapter registry**

Map provider types `OPENAI_OFFICIAL`, `OPENAI_COMPATIBLE`, and `CUSTOM_HTTP` to adapter factories. For `CUSTOM_HTTP`, initially reuse the OpenAI-compatible request shape and mark the type explicitly in code comments.

- [ ] **Step 7: Verify**

Run: `npm test -- tests/jobs tests/providers/openai-compatible.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/server/jobs src/server/providers/adapters tests/jobs tests/providers/openai-compatible.test.ts
git commit -m "feat: add generation job adapters"
```

## Task 6: Local Storage and Image Archiving

**Files:**
- Create: `src/server/storage/types.ts`
- Create: `src/server/storage/local.ts`
- Create: `src/server/storage/archive.ts`
- Create: `storage/generated-images/.gitkeep`
- Create: `tests/storage/local.test.ts`
- Create: `tests/storage/archive.test.ts`

- [ ] **Step 1: Write local storage tests**

Use a temporary directory. Save a buffer with content type `image/png`; assert the returned path is under the storage root and the file exists.

- [ ] **Step 2: Implement storage adapter**

Create `LocalStorageAdapter` with `saveImage({ jobId, index, bytes, extension })`. Use `storage/generated-images/<jobId>/<index>.<extension>`. Create directories recursively.

- [ ] **Step 3: Write archive tests**

Mock `fetch` for upstream URL images and test base64 images. Assert `archiveGeneratedImages` creates one `ImageAsset` per generated image and returns `archive_failed` only when all images fail.

- [ ] **Step 4: Implement archive service**

Create `archiveGeneratedImages(job, generatedImages)` that downloads URL images or decodes base64, saves them through the storage adapter, records `ImageAsset`, and keeps upstream URLs in the database.

- [ ] **Step 5: Verify**

Run: `npm test -- tests/storage`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/server/storage storage/generated-images/.gitkeep tests/storage
git commit -m "feat: add local image archiving"
```

## Task 7: Worker Loop

**Files:**
- Create: `src/server/worker/main.ts`
- Create: `src/server/worker/process-job.ts`
- Create: `tests/worker/process-job.test.ts`

- [ ] **Step 1: Write process-job tests**

Mock provider registry and archive service. Test success path moves a job from `running` to `succeeded` or `archived`. Test adapter errors set status `failed` and persist the error message.

- [ ] **Step 2: Implement single job processor**

Create `processGenerationJob(jobId)` that loads job, model, provider, decrypts the provider API key, calls the adapter, writes normalized upstream response, archives images, and updates final status.

- [ ] **Step 3: Implement polling worker**

Create `src/server/worker/main.ts` that reads `WORKER_POLL_INTERVAL_MS`, repeatedly calls `claimNextJob`, processes claimed jobs, logs errors, and sleeps when no job is available.

- [ ] **Step 4: Verify**

Run: `npm test -- tests/worker`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/worker tests/worker
git commit -m "feat: add generation worker"
```

## Task 8: Conversations, Jobs, and History APIs

**Files:**
- Create: `src/app/api/conversations/route.ts`
- Create: `src/app/api/conversations/[conversationId]/messages/route.ts`
- Create: `src/app/api/generation-jobs/[jobId]/route.ts`
- Create: `src/app/api/history/route.ts`
- Create: `tests/api/conversations.test.ts`
- Create: `tests/api/history.test.ts`

- [ ] **Step 1: Write API handler tests**

Test that a member can create a conversation, submit a prompt with parameters, receive a queued job ID, poll job status, and list their own history.

- [ ] **Step 2: Implement conversation routes**

`POST /api/conversations` creates a conversation. `POST /api/conversations/[conversationId]/messages` creates a user message and queued generation job from selected provider/model parameters.

- [ ] **Step 3: Implement job status and history routes**

`GET /api/generation-jobs/[jobId]` returns status, errors, and image assets for the owner or admin. `GET /api/history` returns the current member's generated assets and related prompts.

- [ ] **Step 4: Verify**

Run: `npm test -- tests/api`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api tests/api
git commit -m "feat: add generation APIs"
```

## Task 9: MVP User Interface

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/generate/page.tsx`
- Create: `src/app/admin/providers/page.tsx`
- Create: `src/app/history/page.tsx`
- Create: `src/components/chat/GenerationChat.tsx`
- Create: `src/components/settings/ParameterPanel.tsx`
- Create: `src/components/admin/ProviderForm.tsx`
- Create: `src/components/assets/ImageGrid.tsx`
- Create: `tests/ui/GenerationChat.test.tsx`
- Create: `tests/ui/ParameterPanel.test.tsx`

- [ ] **Step 1: Write component tests**

Test that `ParameterPanel` renders provider/model/size/count controls and calls `onChange`. Test that `GenerationChat` submits a prompt and displays queued/running/succeeded/failed states.

- [ ] **Step 2: Implement admin provider form**

Build a compact admin page that lists configured providers and lets admins add provider name, type, base URL, API key, default model name, and enabled state.

- [ ] **Step 3: Implement generation page**

Build a work-focused layout with chat as the main column and parameter panel as the secondary column. Keep controls dense and predictable. Show generated images in the chat stream when job status includes assets.

- [ ] **Step 4: Implement history page**

Show a filterable grid of archived images with prompt, model, created time, download link, and reuse action that opens `/generate` with source prompt parameters.

- [ ] **Step 5: Verify**

Run: `npm test -- tests/ui`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/login src/app/generate src/app/admin src/app/history src/components tests/ui
git commit -m "feat: add MVP interface"
```

## Task 10: Docker Deployment and Documentation

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Modify: `README.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Add Dockerfile**

Create a Node 22 Dockerfile that installs dependencies, runs `npx prisma generate`, builds Next.js, and starts with `npm run start`.

- [ ] **Step 2: Add Docker Compose**

Create services:

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: gpt_image_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
  app:
    build: .
    command: npm run dev
    ports:
      - "3000:3000"
    env_file: .env
    volumes:
      - .:/app
      - image-storage:/app/storage/generated-images
    depends_on:
      - postgres
  worker:
    build: .
    command: npm run worker
    env_file: .env
    volumes:
      - .:/app
      - image-storage:/app/storage/generated-images
    depends_on:
      - postgres
volumes:
  postgres-data:
  image-storage:
```

- [ ] **Step 3: Update README commands**

Document:

```sh
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
npm run worker
docker compose up --build
```

Explain that API keys belong in the admin UI, not in committed files.

- [ ] **Step 4: Update AGENTS.md**

Replace the starter-tooling language with concrete commands: `npm test`, `npm run typecheck`, `npm run build`, `docker compose up --build`, and `npx prisma migrate dev`.

- [ ] **Step 5: Verify final MVP checks**

Run: `npm test`

Expected: all tests PASS.

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run build`

Expected: production build exits with code 0.

Run: `docker compose config`

Expected: Compose file validates.

- [ ] **Step 6: Commit**

```bash
git add Dockerfile docker-compose.yml README.md AGENTS.md
git commit -m "chore: add Docker deployment docs"
```

## Coverage Review

- Admin provider/model configuration is covered in Task 4 and Task 9.
- Member chat generation and parameter controls are covered in Task 8 and Task 9.
- Provider adapters and configurable model names are covered in Task 5.
- Postgres persistence is covered in Task 2.
- Worker polling and retries foundation are covered in Task 7.
- Local image archiving is covered in Task 6.
- Docker single-server deployment is covered in Task 10.
- Public registration, billing, multi-tenant SaaS isolation, Redis queues, cloud object storage, localization, and theme systems remain outside this MVP.
