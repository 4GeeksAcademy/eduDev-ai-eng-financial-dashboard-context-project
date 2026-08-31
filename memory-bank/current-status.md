# Current Status

## Verified working state

The latest bounded application verification was Phase 3 on **2026-08-31**, after removal of the unused frontend mock module. The frontend boundary passed all existing containerized checks, and HTTP runtime validation proved that the repository frontend still reached the backend through Vite's `/api` proxy (`rule-validation.md:152-176`).

| Verified boundary | Exact latest evidence | Result |
|---|---|---|
| Active frontend source | Post-deletion searches found no `mockMovements` or `mock-data` reference and one request at `frontend/src/App.tsx:16`. | Sole active frontend request remains `/api/metrics` (`rule-validation.md:50-75`). |
| Frontend lint | `docker compose run --rm --no-deps frontend npm run lint` | Exit 0; no reported errors or warnings (`rule-validation.md:156-159`). |
| Frontend utility tests | `docker compose run --rm --no-deps frontend npm test` | Vitest 4.1.4: 1 file and 5 tests passed, 0 failed (`rule-validation.md:159-160`). |
| Frontend build | `docker compose run --rm --no-deps frontend npm run build` | Exit 0; TypeScript and Vite completed; 2,290 modules transformed (`rule-validation.md:160-160`). |
| Runtime frontend identity | Temporary host publication `5174:5173`, followed by HTTP GET `/` | HTTP 200 with this repository's title and `/src/main.tsx` reference (`rule-validation.md:161-165`). |
| Frontend-to-backend integration | HTTP GET `/api/metrics` through the temporary frontend publication | 360 records; expected five-field shape matched (`rule-validation.md:163-174`). |
| Runtime cleanup | Named one-off removal, `docker compose down --remove-orphans`, service/network checks | No project Compose containers or labeled network remained (`rule-validation.md:167-176`). |

No backend/API path changed in Phase 3, so backend tests were explicitly N/A for that work unit (`rule-validation.md:77-90`, `rule-validation.md:178-180`). The latest backend execution evidence remains Phase 1 on **2026-08-31**: `docker compose exec -T backend pytest` completed with 15 passed, 0 failures, and one Starlette deprecation warning; health, docs, OpenAPI, and raw metrics requests also returned HTTP 200 (`verification.md:133-152`).

## Known warnings and constraints

- **Frontend build warning:** the Phase 3 build emitted a Vite warning because a 584.26 kB minified chunk exceeded 500 kB. The build passed; user impact and remediation are not established (`rule-validation.md:160-160`, `rule-validation.md:183-184`).
- **Backend warning:** the latest backend test run passed with one Starlette deprecation warning. Its root cause and upgrade path were not established (`verification.md:149-152`; `engineering-findings.md:106-114`).
- **Host-port conflict:** an unrelated listener occupied host port 5173 during verification. The configured frontend port remains 5173; host port 5174 was temporary validation only (`verification.md:137-143`; `rule-validation.md:161-174`).
- **Period mismatch:** the UI still passes `2024 - Full Year`, while backend dates roll relative to the current date. Desired product semantics remain unknown (`frontend/src/App.tsx:45-50`; `backend/app/routes.py:65-104`; `.agents/rules/R-02-date-period-coherence.md:36-42`).

Warnings are observations, not authorization for unrelated remediation (`.agents/rules/R-05-containerized-boundary-verification.md:21-29`).

## Known gaps and unknowns

- Production readiness, deployment topology, allowed origins, authentication, authorization, tenant isolation, privacy requirements, persistence, live data, and external consumers are not established (`verification.md:173-190`; `.agents/rules/R-04-api-contract-and-cors.md:36-42`).
- Visual rendering, loading/error behavior in a browser, accessibility, chart interaction, responsiveness, and browser-console state remain untested (`rule-validation.md:178-184`).
- Intended long-term aggregation ownership and production data volume are unknown; current behavior is raw `/api/metrics` plus frontend calculations (`.agents/rules/R-01-api-ui-data-ownership.md:24-44`).
- Minimum Docker/Compose versions and a supported non-Docker workflow are undocumented (`verification.md:183-191`).
- Teaching or external uses not represented by repository imports cannot be disproved (`.agents/rules/R-03-single-mock-data-source.md:34-40`).

## Repository-rule state

Phase 3 commit `37c7de4` added five active rules and validated them against a bounded cleanup (`rule-validation.md:142-150`, `rule-validation.md:186-205`):

| Rule | Current guardrail |
|---|---|
| [R-01](../.agents/rules/R-01-api-ui-data-ownership.md) | Preserve raw `/api/metrics` plus frontend aggregation unless an explicit decision changes ownership. |
| [R-02](../.agents/rules/R-02-date-period-coherence.md) | Keep generated dates and displayed periods coherent; do not invent fixed-calendar semantics. |
| [R-03](../.agents/rules/R-03-single-mock-data-source.md) | Maintain one active mock-data source and prohibit silent fallback data. |
| [R-04](../.agents/rules/R-04-api-contract-and-cors.md) | Protect typed API contracts and require deployment evidence before CORS changes. |
| [R-05](../.agents/rules/R-05-containerized-boundary-verification.md) | Verify each changed boundary through existing Compose paths and report warnings and untested areas. |

`.agents/skills` is absent in the post-Phase-3 repository; no project skill was created for Phase 4. Root guidance requires checking its presence rather than assuming it exists (`AGENTS.md:3-15`).

## Completed academic phases

| Phase | Commit | Authoritative artifact and outcome |
|---|---|---|
| Phase 1 — repository verification | `b4c2134` | [`verification.md`](../verification.md): mapped the repository and recorded bounded container/runtime evidence (`verification.md:1-13`, `verification.md:193-206`). |
| Phase 2 — engineering findings | `f0599b4` | [`engineering-findings.md`](../engineering-findings.md): derived five evidence-backed guardrails and a bounded validation unit (`engineering-findings.md:116-163`, `engineering-findings.md:176-191`). |
| Phase 3 — rule-guided validation | `37c7de4` | [`rule-validation.md`](../rule-validation.md): added the five rules, removed only the unreferenced fixed frontend mock module, and verified the unchanged active path (`rule-validation.md:3-19`, `rule-validation.md:190-207`). |
| Phase 4 — memory bank | Uncommitted in this phase | These four `memory-bank/*.md` documents summarize the post-Phase-3 evidence without changing application behavior. |

## Next evidence-backed decisions

These are decision priorities, not an invented roadmap:

1. **Clarify displayed-period semantics before editing the header or date behavior.** The observed fixed-label/rolling-date mismatch lacks a defined product wording or filtering rule (`engineering-findings.md:52-60`; `.agents/rules/R-02-date-period-coherence.md:36-42`).
2. **Name the intended aggregation owner and consumers before changing API/UI responsibilities or analytical routes.** Current client ownership is proven, but long-term ownership, scale, and external consumers are unknown (`engineering-findings.md:20-38`; `.agents/rules/R-01-api-ui-data-ownership.md:42-48`).
3. **Establish deployment and authentication requirements before changing or evaluating CORS as production policy.** Current permissive settings exist without known production origins or credential requirements (`backend/app/main.py:6-14`; `engineering-findings.md:84-92`).
4. **Choose a supported rendered-UI verification boundary before claiming browser or visual coverage.** Existing tests and HTTP checks stop below that boundary, and no browser command is declared (`engineering-findings.md:96-104`; `rule-validation.md:178-184`).
5. **Assess warnings only in separately scoped work with measured impact.** The bundle-size and Starlette warnings are observed, but neither has an established user impact or approved remediation boundary (`engineering-findings.md:140-150`; `.agents/rules/R-05-containerized-boundary-verification.md:27-40`).
