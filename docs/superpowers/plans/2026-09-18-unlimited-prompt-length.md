# Unlimited Prompt Length Implementation Plan

**Goal:** Remove the 1,000-character frontend limit from positive and negative prompts while retaining a localized current-length indicator.

**Scope:** Only `PromptComposer`, its UI tests, and this plan. Do not change APIs, Prisma, repositories, workers, Provider adapters, or storage.

## Task 1: RED

- [x] Update the existing English counter expectation from `15 / 1000` to `15 characters`.
- [x] Add a regression test proving both textareas have no `maxlength`, accept more than 1,000 characters, and submit the full trimmed positive Prompt only.
- [x] Add a Chinese counter test for `个字符`.
- [x] Run the focused test and confirm it fails because the current implementation still renders `maxLength={1000}` and the old counter.

## Task 2: GREEN

- [x] Add localized singular/plural-safe character-label formatting.
- [x] Remove both `maxLength` attributes.
- [x] Keep Negative Prompt local and preserve existing submit trimming.
- [x] Run the focused test and confirm it passes.

## Task 3: Verification

- [x] Run the complete UI suite.
- [x] Run the full Vitest suite.
- [x] Run strict TypeScript.
- [x] Run the production build.
- [x] Confirm only the intended component, test, plan, and approved spec are part of this change.
