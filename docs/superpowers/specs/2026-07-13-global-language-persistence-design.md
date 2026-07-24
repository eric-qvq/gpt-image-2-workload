# Global Language Persistence Design

## Goal

Make the authenticated interface switch completely between English and Simplified Chinese. A selected language must remain active when navigating between Overview, Create, History, Batch Jobs, Dataset, Models, API Keys, Usage, and Settings, and it must be restored after a browser refresh.

## Existing Problem

`ShellStateProvider` currently initializes `language` to `"en"` every time an `AppShell` mounts. Each route renders its own shell, so navigation recreates the provider and resets the selector. Only a few shell and prototype components read `language`; most page headings, forms, empty states, dialogs, and actions still contain hard-coded English.

## Design

Keep the existing authenticated page and server-data boundaries. `ShellState` remains the single owner of the selected language, but its setter also writes a validated `"en"` or `"zh"` value to `localStorage`. On mount it restores the saved value. Every language change updates `document.documentElement.lang` to `en` or `zh-CN` and exposes the same state to all shell and page components.

Add a small typed localization helper that selects component-owned English/Chinese copy from `useShellState`. Copy remains near the component that renders it; dynamic values such as account names, model names, prompts, URLs, dates, API error text, and stored data remain unchanged.

Server-rendered routes keep authentication and repository calls on the server. Static headings and data-dependent page sections that need live language switching move into focused client components receiving only serializable display data. No API, Prisma, provider, job, worker, archive, or storage code changes.

## Coverage

Translate the authenticated shell, mobile navigation, utility panels, logout action, Overview, Create workspace, History controls and image actions, Models catalog and admin forms, shared prototype framing, Batch Jobs, Dataset, API Keys, Usage, and Settings. Translate accessible labels, placeholders, dialog close labels, empty states, and local feedback messages together with visible text.

## Persistence and Failure Handling

Use the key `gpt-image-language`. Ignore missing or invalid values and fall back to English. Browser storage failures must not break rendering; the in-memory selection still works. A `storage` event updates other open tabs. Language is a browser preference only and is not written to the database.

## Acceptance Criteria

- Choosing Chinese updates the current shell and page body, not only the sidebar.
- Navigating between authenticated routes keeps the selected language.
- Refreshing restores the last valid language.
- Switching back to English updates the entire interface.
- `<html lang>` follows the active language.
- Dynamic user and provider data is not translated.
- Focused UI tests, the full suite, typecheck, and production build pass.
