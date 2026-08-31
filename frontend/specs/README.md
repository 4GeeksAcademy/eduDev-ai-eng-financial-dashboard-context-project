# Financial Dashboard Frontend Specifications

This directory specifies three frontend features: a dashboard-wide date range, anomaly alerts, and a B2B/B2C income comparison. It is an implementation handoff, not an implementation: this assignment adds no React or JSX, request wiring, backend or runtime change, or dependency.

## Evidence convention

- **Verified API fact:** behavior or shape confirmed in the current backend route models and handlers.
- **Frontend specification decision:** UI behavior chosen for this assignment without changing the API.
- **Derived display value:** a value calculated for presentation from typed API fields; it is not a new API field.

## Endpoint contract matrix

All date parameters below are optional and inclusive. “Array” means the response is the raw JSON array, with no wrapper object.

| Feature | Endpoint | Request type | Response type | Shape | Purpose |
|---|---|---|---|---|---|
| 1 | `GET /api/metrics/facets` | None | [`FacetsResponse`](./api-types.ts) | Object | Obtain the global available date range and filter references. |
| 1 | `GET /api/metrics` with the active dates | [`DateRangeFilter`](./param-types.ts) | [`FinancialMovement[]`](../src/lib/financial-types.ts) | Array | Supply the existing home-dashboard movements filtered by either, both, or neither date boundary. |
| 2 | `GET /api/metrics/alerts` | [`AlertsParams`](./param-types.ts) | [`AlertsResponse`](./api-types.ts), an array of `AlertEntry` | Array | Obtain outcome periods whose increase exceeds the requested threshold. |
| 3 | `GET /api/metrics/categories/top` twice | [`TopCategoriesParams`](./param-types.ts) | [`TopCategoriesResponse`](./api-types.ts), an array of `CategoryEntry` | Array | Obtain up to five ranked income categories independently for B2B and B2C. |
| 3 | `GET /api/metrics/facets` | None | [`FacetsResponse`](./api-types.ts) | Object | Supply global category references; these are not segmented by business type. |
| 3 | `GET /api/metrics/summary` twice | [`SummaryParams`](./param-types.ts) | [`SummaryResponse`](./api-types.ts), an array of `SummaryEntry` | Array | Obtain complete grouped income data for each business type; these full responses provide panel totals and chart values. |

The summary endpoint is the verified source for full B2B and B2C totals. Top-category responses are ranked subsets and MUST NOT be treated as group totals.

## Parameter contracts

| Request | Required values and behavior |
|---|---|
| Shared dates | `start_date?: string` and `end_date?: string`, each formatted `YYYY-MM-DD`. API filtering includes both supplied boundaries. Omit an empty boundary rather than sending an invented value. |
| Alerts | `threshold` is required by `AlertsParams`. The frontend accepts `0.01..1.0` inclusive and starts at `0.3`. **Verified API variance:** the API accepts any value greater than or equal to `0` and has no maximum; the narrower range is a frontend specification decision. Optional active dates are included. The API's monthly grouping default is used. |
| Top categories | Send `operation_type=income`, `limit=5`, and one required `business_type` value: `B2B` or `B2C`. Include optional active dates. |
| Summary | Send `operation_type=income` and one required `business_type`: `B2B` or `B2C`. Include optional active dates. Omit `group_by` so the verified API default, monthly grouping, applies. |

## Feature 1 — Date range filter

Use [`DateRangeFilter`](./param-types.ts) as the single active range shared by dashboard data requests.

- Both fields empty means all available data: omit both date parameters.
- With only one boundary, send only that field. Do not manufacture the other boundary.
- Show the available-range hint from `FacetsResponse.min_date` and `FacetsResponse.max_date`.
- When both values exist and `start_date` is later than `end_date`, show the inline message **“Start date must be on or before end date.”** Do not apply it or start requests with it; retain the last valid active range.
- A valid range applies to all home-dashboard data, including the existing filtered metrics and anomaly alerts. The comparison view also receives the same valid range for all four of its segmented requests.

### Edge cases

| Case | Required UI result |
|---|---|
| Both date inputs are empty. | Show the unfiltered dashboard and issue date-aware requests without either date parameter. |
| Exactly one boundary is present. | Apply that one-sided inclusive filter and send only the populated field. |
| Start is later than end. | Show **“Start date must be on or before end date.”**, keep the last valid dashboard data, and make no requests for the invalid range. |

## Feature 2 — Anomaly alerts

The section combines the active date range, a threshold control, and a table. The default frontend threshold is `0.3`.

Render exactly these four columns:

| Column label | API field | Required formatting |
|---|---|---|
| Period | `period` | Display the returned string. |
| Outcome total | `outcome_total` | Currency. |
| Baseline average | `baseline_average` | Currency. |
| Increase | `increase_ratio` | **Derived display value:** `increase_ratio * 100`, formatted as a percentage; `0.3` displays as `30%`. |

- Include the valid active `start_date` and/or `end_date` in the alerts request.
- For a threshold below `0.01`, above `1.0`, or otherwise not a valid number, show **“Threshold must be a number from 0.01 to 1.0.”** Do not apply it or request alerts with it; retain the last valid threshold and rows.
- If the response is empty, keep the section visible and show **“No anomaly alerts found for the selected filters.”**

### Accepted PM/API variance

The PM wording says the baseline covers the previous three periods. **Verified API fact:** the current backend calculates `baseline_average` from all prior outcome periods available in the filtered summary, not exactly the previous three. For this spec-only assignment, display the API-provided value under the label **“Baseline average.”** Do not recompute it and do not label it as a three-period average. This is an accepted API variance for this frontend contract; correcting the backend remains out of scope.

### Edge cases

| Case | Required UI result |
|---|---|
| The alerts response is an empty array. | Keep the section visible and show **“No anomaly alerts found for the selected filters.”** |
| Threshold is outside `0.01..1.0` or is not numeric. | Show the exact inline threshold error, preserve the last valid threshold and rows, and make no request with the invalid value. |
| Only one active date boundary exists. | Request alerts with that boundary only and render the returned four-field rows normally. |

## Feature 3 — B2B vs B2C income comparison

Build the comparison from independent group requests, not from global facets or a top-five subtotal.

1. Request top categories once with `business_type=B2B` and once with `business_type=B2C`; both requests also use `operation_type=income`, `limit=5`, and the optional active dates.
2. Request summaries once for B2B and once for B2C; both use `operation_type=income`, optional active dates, and the API's default monthly grouping.
3. Derive each full group total as `sum(summaryEntry.income)` over that group's complete `SummaryResponse`.
4. For each category row, derive its percentage as `total_amount / groupTotalIncome * 100`. If `groupTotalIncome` is `0`, display `0%` instead of dividing by zero.
5. Use `facets.categories` only as a global reference list. It does not indicate which categories are available for a specific business group.
6. Render the chart with exactly two values: B2B total income and B2C total income, each derived from its full summary response.

Each category panel owns its empty state. An empty B2B result must not hide B2C, and vice versa. Use these exact messages:

- B2B: **“No top income categories found for B2B.”**
- B2C: **“No top income categories found for B2C.”**

If both summary responses are empty, do not render a misleading zero-value chart; show **“No income comparison data found for the selected filters.”** A panel's top-category state and the chart's summary state are independent.

### Edge cases

| Case | Required UI result |
|---|---|
| One top-category response is empty and the other has rows. | Show the exact empty message only in the empty group's panel; render the other panel normally. |
| A group total is zero while category rows exist. | Render those rows with `0%`; never show `Infinity`, `NaN`, or use the top-five sum as a denominator. |
| Both summary responses are empty. | Show **“No income comparison data found for the selected filters.”** instead of the two-value chart; keep each category panel governed by its own response. |

A response with fewer than five category rows is valid: render only the returned rows and add no placeholders.

## Shared request states

While data required by a section is pending, show one concise loading message. If an API request fails, show one concise API-error message for the affected section; do not replace the failure with mock data. More elaborate request-state behavior is not part of this assignment.

## Type and component traceability

| Feature | API type exports | Parameter type exports | Component contract sections |
|---|---|---|---|
| 1 — Date range | `FacetsResponse` in [`api-types.ts`](./api-types.ts); existing `FinancialMovement` in [`financial-types.ts`](../src/lib/financial-types.ts) | `DateRangeFilter` in [`param-types.ts`](./param-types.ts) | [`DateRangeFilter`](./components.md#daterangefilter) |
| 2 — Alerts | `AlertEntry`, `AlertsResponse` in [`api-types.ts`](./api-types.ts) | `DateRangeFilter`, `AlertsParams` in [`param-types.ts`](./param-types.ts) | [`AnomalyAlertsSection`](./components.md#anomalyalertssection), [`AnomalyAlertsTable`](./components.md#anomalyalertstable) |
| 3 — Comparison | `BusinessType`, `Category`, `FacetsResponse`, `CategoryEntry`, `TopCategoriesResponse`, `SummaryEntry`, `SummaryResponse` in [`api-types.ts`](./api-types.ts) | `DateRangeFilter`, `TopCategoriesParams`, `SummaryParams` in [`param-types.ts`](./param-types.ts) | [`BusinessComparisonView`](./components.md#businesscomparisonview), [`TopCategoriesTable`](./components.md#topcategoriestable), [`IncomeComparisonChart`](./components.md#incomecomparisonchart) |

## TypeScript verification

The application TypeScript configuration includes only `src`, so the standalone specification types use the isolated strict [`tsconfig.json`](./tsconfig.json), whose include pattern covers the TypeScript files in this directory.

From `frontend/specs`, run exactly:

```bash
npx tsc --noEmit
```

This verifies static compatibility under strict TypeScript settings. It does not validate runtime strings: `start_date` and `end_date` remain TypeScript `string` values, so TypeScript alone cannot prove `YYYY-MM-DD` syntax or calendar validity.

## Implementation handoff checklist

- [ ] Reuse the exact exported types linked above; do not reconstruct API shapes locally.
- [ ] Maintain one last-valid `DateRangeFilter` and propagate only populated boundaries.
- [ ] Filter existing metrics and alerts with the same valid active range.
- [ ] Enforce the frontend threshold range and exact inline/empty messages before request wiring.
- [ ] Keep B2B and B2C top-category and summary requests independent.
- [ ] Compute percentages and chart values only from the documented fields and full-summary totals.
- [ ] Keep each panel's empty state independent and use the both-empty summary chart rule.
- [ ] Run the isolated strict typecheck after implementing the types or their consumers.

## Out of scope

- React/JSX implementation and request wiring.
- Backend behavior, API models, runtime configuration, or the accepted baseline variance.
- New dependencies.
- Authentication, caching, retries, debouncing, pagination, telemetry, responsive breakpoints, routing-library choice, or state-library choice.
