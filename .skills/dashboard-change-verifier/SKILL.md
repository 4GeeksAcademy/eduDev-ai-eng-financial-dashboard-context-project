---
name: dashboard-change-verifier
description: "Trigger: dashboard change, pre-merge verification, verify frontend or API. Select and report proportional checks for this repository."
license: Apache-2.0
metadata:
  author: "edugonzalezLab"
  version: "1.0"
---

## Activation Contract

Load this skill before merging a dashboard change. Objective: verify the changed repository boundaries without expanding scope.

Inputs:
- changed paths from Git;
- applicable rules under `.agents/rules/`;
- exact commands, results, warnings, blockers, and manual observations already collected.

## Hard Rules

- Classify every check as **required** or **N/A** from the changed paths; explain each N/A.
- Use the existing Docker Compose services and declared scripts. Do not install dependencies or change configured ports.
- Treat frontend as Vite/React. Its existing automated checks are lint, test, and build.
- Mark backend checks N/A when backend/API paths are untouched.
- Record pre-existing warnings; do not fix them unless separately scoped.
- Keep port 5173 configured. If occupied, use temporary host publication `5174:5173` and clean it up.

## Decision Gates

| Changed boundary | Required checks |
|---|---|
| Only `.skills/**`, `AGENTS.md`, and `memory-bank/**` | `git diff --check` and `git status --short --untracked-files=all`; application checks N/A |
| Frontend source, tests, or config | frontend lint, test, and build |
| Served UI, request path, or proxy | frontend checks plus runtime/manual verification |
| Backend/API | `docker compose exec -T backend pytest` plus affected contract checks |
| Cross-boundary contract | frontend and backend checks plus proxy/runtime verification |

## Execution Steps

1. Read `AGENTS.md`, the memory bank, and all rules matching the changed paths.
2. List changed paths and assign each check required or N/A before execution.
3. Run frontend checks with `docker compose run --rm --no-deps frontend npm run lint`, `docker compose run --rm --no-deps frontend npm test`, and `docker compose run --rm --no-deps frontend npm run build` when required.
4. For backend/API changes, run `docker compose exec -T backend pytest` and inspect the affected response contract.
5. For served behavior, verify `GET /` identifies this frontend and `GET /api/metrics` succeeds through Vite. If 5173 is occupied, run `docker compose run -d --name dashboard-frontend-5174 --no-deps -p 5174:5173 frontend`, then check `curl --fail --silent --show-error --include http://localhost:5174/` and `curl --fail --silent --show-error http://localhost:5174/api/metrics`. Manually inspect the changed UI behavior; HTTP does not prove accessibility or rendering.
6. Remove the one-off container with `docker rm -f dashboard-frontend-5174` when used, run `docker compose down --remove-orphans`, then run `git diff --check` and `git status --short --untracked-files=all`.

## Output Contract

Return a compact verification table with boundary, classification, command/check, result, warnings, and evidence limits. Acceptance requires all required checks to pass, every N/A to cite unchanged paths, cleanup to complete, and failures or pending manual checks to remain explicit merge blockers.

## References

- `../../AGENTS.md`
- `../../.agents/rules/R-05-containerized-boundary-verification.md`
- `../../frontend/package.json`
- `../../docker-compose.yml`
- `../../memory-bank/current-status.md`
