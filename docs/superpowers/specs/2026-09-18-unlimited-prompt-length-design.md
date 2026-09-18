# Unlimited Prompt Length Design

## Goal

Remove the application's 1,000-character frontend limit from both the positive Prompt and the interface-preview Negative Prompt while preserving truthful character feedback and all existing request boundaries.

## Current Behavior

`PromptComposer` currently applies `maxLength={1000}` to both textareas and renders the positive Prompt counter as `current count / 1000`. No matching 1,000-character restriction exists in the generation API, Prisma schema, job repository, worker, or Provider adapter.

The browser therefore blocks additional input before the request reaches the real generation path. Negative Prompt remains interface-preview-only and is not included in the Provider request.

## Approved Design

- Remove `maxLength={1000}` from the positive Prompt textarea.
- Remove `maxLength={1000}` from the Negative Prompt textarea.
- Keep the positive Prompt character count without presenting a maximum:
  - English: `current count characters`;
  - Simplified Chinese: `current count 个字符`.
- Continue counting the trimmed positive Prompt, matching the existing submit behavior that trims surrounding whitespace.
- Do not add a Negative Prompt counter.
- Do not truncate, transform, or silently shorten either input.
- Keep Negative Prompt in local preview state only; it must not enter the real generation payload.
- Preserve real upstream Provider errors if a configured Provider enforces its own input limit.

## Files

- Modify `src/components/generate/PromptComposer.tsx`.
- Modify `tests/ui/GenerationChat.test.tsx`.

No API route, Prisma, repository, worker, archive, storage, or Provider adapter file should change.

## Testing Strategy

Use test-driven development:

1. Update the existing character-counter assertion to the unlimited English label.
2. Add a regression test that enters more than 1,000 characters in both textareas.
3. Verify neither textarea has a `maxlength` attribute.
4. Submit the form and verify the complete trimmed positive Prompt reaches `onSubmit` without truncation.
5. Verify the long Negative Prompt remains local and is not submitted.
6. Verify the Chinese counter label.
7. Run the focused GenerationChat test, complete UI suite, full test suite, typecheck, and production build.

## Accessibility and Error Handling

The character counter remains visible text and updates with the current Prompt. Existing labels, form semantics, disabled-state behavior, and keyboard behavior remain unchanged. No new client error is introduced. Provider-side input-limit errors continue through the existing real error path.

## Acceptance Criteria

- Both Prompt textareas accept content longer than 1,000 characters.
- Neither textarea renders a `maxlength` attribute.
- The positive Prompt counter shows only the current localized character count.
- A positive Prompt longer than 1,000 characters is submitted in full after trimming outer whitespace.
- Negative Prompt remains interface-preview-only and is never added to the real request.
- Focused and complete verification gates pass.
