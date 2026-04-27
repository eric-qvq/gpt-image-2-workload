# GPT Image Delivery Platform Design

## Goal

Build an internal team platform for configurable image generation providers. Admins configure API keys, base URLs, models, and defaults. Members use a chat-first interface with a parameter panel to generate, archive, reuse, and download images.

## Scope

The first version is a single-server Docker Compose deployment. It supports OpenAI and arbitrary OpenAI-compatible or custom HTTP providers through provider adapters. Model names are configurable and must not be hard-coded, because the platform needs to support official models and proxy or third-party model names such as `gpt-image-2`.

## Architecture

Use a Docker Compose MVP with four main parts:

- Web/API service: login, role checks, conversations, image history, admin configuration, task creation.
- Worker service: pulls queued generation jobs, calls provider adapters, records upstream responses, downloads images, and updates job state.
- Postgres: stores users, providers, models, conversations, messages, jobs, and image assets.
- Local file storage: archives generated images into a Docker volume, behind a storage adapter that can later be replaced with S3, R2, OSS, or similar object storage.

## Roles

- Admin: manages users, providers, models, default parameters, enabled status, simple limits, and failure logs.
- Member: creates conversations, adjusts allowed parameters, generates images, views personal history, downloads images, and reuses prompts or prior images.

## Core UX

The main generation page combines chat and controls. The chat stream captures user intent and iterative changes such as "make the background cyberpunk" or "generate four landscape variants." A parameter panel controls provider, model, size, count, quality, output format, and optional reference image upload. Admin defaults prefill the panel; members can adjust only allowed options.

## Data Model

Initial tables:

- `users`: account, password hash, role, status.
- `providers`: name, type, base URL, encrypted API key, enabled state.
- `models`: provider ID, model name, default parameters, capability metadata.
- `conversations`: owner and title.
- `messages`: role, content, conversation ID, related job ID.
- `generation_jobs`: provider, model, request parameters, status, errors, retry count.
- `image_assets`: upstream URL, local path, size, dimensions, source job ID.

## Job Flow

Statuses are `queued`, `running`, `succeeded`, `failed`, `canceled`, `archived`, and `archive_failed`.

1. Member sends a chat request with current parameters.
2. API creates a message and queued generation job.
3. Worker claims the job and loads provider/model configuration.
4. Worker calls the correct adapter: OpenAI official, OpenAI-compatible, or custom HTTP.
5. Worker saves upstream image URLs or base64 outputs and marks generation success or failure.
6. UI displays available image results as soon as they are usable.
7. Worker downloads images into local storage and records image assets.
8. Users can retry failed jobs or reuse successful outputs.

## Technology

- Next.js and TypeScript for Web/API.
- Prisma for schema, migrations, and typed database access.
- Postgres for persistent team and job data.
- Database polling for the first worker queue to avoid Redis in the MVP.
- Docker Compose for `app`, `worker`, `postgres`, and storage volume.

Suggested structure:

```text
src/
  app/
  components/
  server/
    auth/
    providers/
    jobs/
    storage/
    db/
prisma/
storage/generated-images/
docs/specs/
```

## Non-Goals

The MVP does not include public registration, billing, multi-tenant SaaS isolation, complex moderation review, Redis queues, cloud object storage, theme systems, or localization. These can be added after the internal workflow is stable.

## Validation

The first usable milestone should prove that an admin can configure a provider and model, a member can create a conversation, submit a generation request, receive images, and see those images archived locally with retrievable history.
