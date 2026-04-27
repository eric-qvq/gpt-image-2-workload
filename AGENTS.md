# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a starter project with `README.md` at the root and no source tree yet. Keep root files limited to project metadata and contributor-facing documentation. When implementation begins, use a predictable layout:

```text
src/        application or library code
tests/      automated tests mirroring src modules
assets/     images, fixtures, prompts, or sample outputs
docs/       design notes and longer documentation
```

Prefer small, focused modules and name directories after the workflow or component they support.

## Build, Test, and Development Commands

No build or test tooling is configured yet. Add commands only when backed by committed files such as `package.json`, `pyproject.toml`, `Makefile`, or similar. Document the final commands in `README.md` and keep them stable. Common patterns to use when appropriate:

```sh
npm test        # run JavaScript/TypeScript tests
npm run build   # build distributable output
python -m pytest # run Python tests
```

## Coding Style & Naming Conventions

Follow the conventions of the language introduced. Use descriptive, lowercase file names with separators where helpful, such as `image-queue.ts` or `image_queue.py`. Keep generated assets and sample data clearly named by purpose. If a formatter or linter is added, commit its configuration and include the exact command in the README.

## Testing Guidelines

Add tests with new behavior. Place tests in `tests/` and mirror source names, for example `tests/test_image_queue.py` or `tests/image-queue.test.ts`. Cover core logic, error paths, and regressions for fixed bugs. Until a framework is selected, note any manual verification steps in pull requests.

## Commit & Pull Request Guidelines

Current history contains only `first commit`, so no detailed convention is established. Use short imperative commit messages, for example `Add image workload runner`. Pull requests should include a summary, test or manual verification notes, linked issues when relevant, and screenshots or sample outputs for visual or generated artifacts.

## Agent-Specific Instructions

Inspect the workspace before editing and preserve existing user changes. Keep documentation concise, update this guide when tooling becomes concrete, and avoid inventing commands or requirements that are not present in the repository.
