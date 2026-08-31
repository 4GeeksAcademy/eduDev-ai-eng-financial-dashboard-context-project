# R-05 — Verify the Changed Boundary in Containers

## Scope

This rule applies to all source changes, tests, builds, runtime checks, delivery notes, environmental blockers, warning handling, and project-container cleanup.

## Repository evidence

- The repository declares frontend lint, test, and build scripts (`frontend/package.json:6-13`) and backend test dependencies (`backend/requirements.txt:1-6`).
- Compose defines the existing frontend and backend development services (`docker-compose.yml:1-22`).
- Phase 1 verified containerized tests, build, and runtime proxy behavior, while observing an occupied host port 5173 and a Vite chunk-size warning (`verification.md:133-152`).
- Phase 2 found that host `eslint` and `pytest` were unavailable and prohibited ad hoc installation as a substitute for the repository path (`engineering-findings.md:106-114`).
- Existing frontend tests cover utilities, not rendered application behavior (`engineering-findings.md:96-104`).

This evidence implements **R-05** from findings **F-TEST-01**, **F-OPS-01**, and **F-BE-01** (`engineering-findings.md:96-114`, `engineering-findings.md:124-136`).

## Rationale

Verification must match the changed boundary and use a reproducible environment. A passing lower-level test does not prove an untested UI boundary, while environmental port conflicts and known warnings should be reported rather than converted into unrelated code or configuration changes.

## Mandatory guidance

- Contributors **MUST** use repository-declared scripts through the existing Compose services unless a supported host environment is already documented and present.
- Contributors **MUST NOT** install dependencies, add packages, change configured ports, or introduce tools merely to complete verification.
- Contributors **MUST** run checks that match every changed boundary: utility tests for calculations, backend `TestClient` tests for APIs, frontend lint/build for TypeScript integration, and an explicit runtime/manual check when served frontend behavior is relevant.
- **WHEN** host port 5173 is occupied, contributors **MUST** preserve the configured service port and may use the documented temporary host-only `5174:5173` publication.
- Contributors **MUST** record exact commands, actual pass/fail results, warnings, environmental blockers, untested boundaries, and cleanup.
- Contributors **MUST NOT** remediate an unrelated warning in the same bounded work unit.
- **WHEN** runtime verification finishes or fails, contributors **MUST** remove one-off containers and run Compose cleanup with orphan removal, then confirm no project containers remain.

## Required verification

- Run each repository-declared check required by the changed paths and record its exact result.
- For frontend runtime checks, verify that returned HTML identifies this repository and that `/api/metrics` succeeds through the Vite proxy.
- Inspect the final changed-file set to justify any intentionally omitted boundary, including backend tests.
- Run `git diff --check` and report `git status --short` before handoff.

## Boundaries and unknowns

No browser-automation command is declared, so HTTP runtime checks do not prove rendering, accessibility, chart interaction, responsiveness, or browser-console behavior. Minimum Docker/Compose versions and a supported non-Docker workflow are unknown. Existing Starlette and bundle-size warnings remain observations unless separately scoped.

## Rollback and escalation

Failed checks **MUST** block acceptance unless the failure is proved to be an environmental blocker and the affected behavior is explicitly left unverified. Cleanup failure **MUST** be escalated with remaining container/network names. Rollback **MUST** remove only the bounded work unit and must not include opportunistic warning or environment changes.
