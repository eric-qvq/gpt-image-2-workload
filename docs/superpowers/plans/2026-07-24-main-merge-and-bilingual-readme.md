# Main Integration and Bilingual README Implementation Plan

**Goal:** Publish the complete verified GPT Image Workbench application on local `main` with a Chinese-first bilingual README while preserving feature history and coordination files.

**Safety:** Work in the existing linked worktree. Do not push, force-push, reset, clean, recreate worktrees, delete Docker volumes, or commit secrets and runtime data.

## Task 1: Audit publication facts

- [x] Verify `main`, `feature/gpt-image-platform`, their merge base, and remote configuration.
- [x] Read Compose, environment, Prisma, routes, localization, preview boundaries, worker configuration, and existing README.
- [x] Confirm `.env`, `.next`, `node_modules`, generated images, and local tool folders are ignored.

## Task 2: Write the publication README

- [x] Replace obsolete linked-worktree-only startup instructions.
- [x] Add a Chinese primary overview and concise English overview.
- [x] Document connected features separately from interface-preview features.
- [x] Document Docker and non-Docker startup, Provider setup, environment variables, volumes, tests, structure, Git workflow, and troubleshooting.
- [x] Reference the tracked interface image without inventing a hosted demo or unsupported capability.

## Task 3: Verify the feature checkpoint

- [x] Scan candidate files for secrets and unwanted runtime data.
- [x] Run `npm.cmd test`.
- [x] Run `npm.cmd run typecheck`.
- [x] Run `npm.cmd run build`.
- [x] Run `docker compose config --quiet`.
- [x] Run Git diff and staged-file safety checks.

## Task 4: Commit the feature checkpoint

- [x] Stage all intended application, test, documentation, and README changes.
- [x] Inspect every staged path before committing.
- [ ] Commit one complete feature checkpoint without pushing.

## Task 5: Integrate into main

- [ ] Merge `feature/gpt-image-platform` into `main` with `--no-ff`.
- [ ] Resolve only genuine coordination-file conflicts.
- [ ] Keep the bilingual README, current safety guidance, application source, tests, and historical documents.
- [ ] Update root guidance only where the merged root runtime makes old worktree-only wording inaccurate.

## Task 6: Verify merged main

- [ ] Confirm the runnable application is tracked at the `main` root.
- [ ] Run the complete test, typecheck, build, and Compose gates from `main`.
- [ ] Verify Git history connects the feature branch to `main`.
- [ ] Verify no sensitive or ignored runtime files are committed.
- [ ] Create a local annotated checkpoint tag.
- [ ] Report exact user push commands without pushing.

## Completion criteria

- GitHub-ready `main` contains the complete application and bilingual README.
- Feature history remains reachable.
- Automated gates pass before and after integration.
- No secret, generated image, database, dependency, or build artifact is committed.
- No remote state is changed by this implementation.
