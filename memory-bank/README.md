# Project Memory Bank

This directory is the maintainable entry point for the repository's verified product, technology, and current-state context. It summarizes evidence without replacing the authoritative phase records.

**Last verified:** 2026-08-31, against the repository state after Phase 3 commit `37c7de4` and the bounded results in [`rule-validation.md`](../rule-validation.md#verification-commands-and-actual-results).

## Read in this order

1. [`product-overview.md`](./product-overview.md) — demonstrated behavior, data flow, capability boundaries, and non-claims.
2. [`tech-stack.md`](./tech-stack.md) — declared technologies, dependencies, services, configuration, and existing commands.
3. [`current-status.md`](./current-status.md) — latest verification, warnings, gaps, rule state, completed phases, and evidence-backed decisions.

Repository guardrails are authoritative for future work:

- [R-01 — Preserve API-to-UI Data Ownership](../.agents/rules/R-01-api-ui-data-ownership.md)
- [R-02 — Keep Dates and Displayed Periods Coherent](../.agents/rules/R-02-date-period-coherence.md)
- [R-03 — Maintain One Active Mock-Data Source](../.agents/rules/R-03-single-mock-data-source.md)
- [R-04 — Protect API Contracts and CORS Decisions](../.agents/rules/R-04-api-contract-and-cors.md)
- [R-05 — Verify the Changed Boundary in Containers](../.agents/rules/R-05-containerized-boundary-verification.md)

## Evidence standard

- **Fact** means the statement is directly supported by a cited current path and line range or by a committed command result.
- **Inference** means the interpretation is bounded by cited facts and is not presented as a requirement.
- **Unknown** means the repository and completed verification do not establish the claim.
- Runtime results are dated. Source citations describe the post-Phase-3 tree; command claims identify the phase record that captured the actual result (`verification.md:133-154`; `rule-validation.md:152-176`).
- A missing repository consumer is evidence only within this repository, not proof that external consumers do not exist (`.agents/rules/R-01-api-ui-data-ownership.md:36-44`).

## Maintenance guidance

- Read `AGENTS.md`, all current `.agents/rules/*`, and this memory bank before changing the project (`AGENTS.md:3-15`).
- Update only statements affected by verified repository changes; retain the **Fact**, **Inference**, and **Unknown** distinctions.
- Cite exact current source/configuration lines. For execution claims, record the exact command, date, result, warnings, untested boundaries, and cleanup under R-05 (`.agents/rules/R-05-containerized-boundary-verification.md:21-40`).
- Preserve `http://localhost:5173` as the configured frontend URL. Host port 5174 is only a documented temporary publication when 5173 is occupied, not project configuration (`verification.md:109-128`; `rule-validation.md:161-174`).
- Do not turn unresolved product, API, deployment, or security questions into facts or a roadmap. Link the decision gap and evidence instead.
- Keep summaries concise; do not duplicate [`verification.md`](../verification.md), [`engineering-findings.md`](../engineering-findings.md), or [`rule-validation.md`](../rule-validation.md) verbatim.

## Phase 4 acceptance checklist

- [x] Root guidance and all five repository rules were read before task-specific work.
- [x] `.agents/skills` was confirmed absent and was not created.
- [x] Phase 1 (`b4c2134`), Phase 2 (`f0599b4`), and Phase 3 (`37c7de4`) authoritative artifacts were reviewed.
- [x] The post-Phase-3 source reflects deletion of the unreferenced frontend mock module and retains `/api/metrics` as the sole active frontend request.
- [x] Product, stack, and status statements distinguish facts, inferences, and unknowns and cite exact evidence.
- [x] The configured frontend URL remains port 5173; temporary port 5174 evidence is bounded as host-only validation.
- [x] No production-readiness, live/persistent-data, authentication, deployment-policy, external-consumer, or browser/visual-coverage claim was introduced.
- [x] All four memory-bank files and their cross-links were read back and validated.
- [x] Only `memory-bank/*.md` is changed or untracked for Phase 4, apart from the pre-existing excluded `.atl/` entries.
- [x] `git diff --check` and `git status --short --untracked-files=all` were run; no files were staged.
