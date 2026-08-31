# Frontend Component Specifications

This document defines the component responsibilities and UI contracts for the date filter, anomaly alerts, and B2B/B2C comparison features. The contracts use the shared types in `api-types.ts` and `param-types.ts`.

## Feature 1 — Date range filter

### `DateRangeFilter`

**Responsibility:** Provide the dashboard-wide optional date range at the top of the home dashboard without adding unrelated controls.

#### Props

| Prop | TypeScript type | Purpose |
|---|---|---|
| `value` | `DateRangeFilter` | The currently active optional start and end dates. |
| `facets` | `FacetsResponse` | Supplies `min_date` and `max_date` for the available-range hint. |
| `onChange` | `(value: DateRangeFilter) => void` | Propagates a valid date selection to the feature requests. |

#### Layout and behavior

- Render a compact row with two date inputs: start date and end date.
- Place the component at the top of the home dashboard so the selected range can apply to the dashboard features below it.
- Display `facets.min_date` and `facets.max_date` near the inputs as the available-range hint.
- Both dates are optional. When both inputs are empty, use all available data and propagate neither date parameter.
- When only one date is provided, propagate only its corresponding `start_date` or `end_date` parameter. Do not create the missing boundary.
- When both dates are present and the start date is after the end date, show an inline validation message and do not apply the invalid range.
- The specification does not add Apply or Clear buttons; valid input changes use `onChange` directly.

## Feature 2 — Anomaly alerts

### `AnomalyAlertsSection`

**Responsibility:** Coordinate the alert threshold control, the active date range, and the alert table while keeping the section visible for every valid response.

#### Props

| Prop | TypeScript type | Purpose |
|---|---|---|
| `dateRange` | `DateRangeFilter` | The valid active date range from `DateRangeFilter`. |
| `threshold` | `AlertsParams['threshold']` | The active ratio threshold used for alerts. |
| `alerts` | `AlertsResponse` | The alert rows to pass to `AnomalyAlertsTable`. |
| `onParamsChange` | `(params: AlertsParams) => void` | Applies a valid threshold together with the active optional date parameters. |

#### Layout and behavior

- Render a threshold number control followed by `AnomalyAlertsTable` in the same section.
- The PM/UI threshold contract is a number from `0.01` through `1.0`, inclusive, with `0.3` as the default.
- If the threshold is outside that range, show an inline validation message and do not apply or request that value.
- Include the active `start_date` and/or `end_date` from Feature 1 in `AlertsParams`. Preserve the single-date behavior instead of inventing the missing boundary.
- Keep the section visible when `alerts` is empty so the explicit table empty state remains visible.

### `AnomalyAlertsTable`

**Responsibility:** Render the anomaly alert response as a four-column table or show the required empty message.

#### Props

| Prop | TypeScript type | Purpose |
|---|---|---|
| `alerts` | `AlertsResponse` | The rows returned by the alerts endpoint. |

#### Layout and behavior

Render exactly these four columns:

| Column | API field | Field type | Display |
|---|---|---|---|
| Period | `period` | `string` | Render the returned period label. |
| Outcome total | `outcome_total` | `number` | Format as currency. |
| Baseline average | `baseline_average` | `number` | Format as currency. |
| Increase | `increase_ratio` | `number` | Convert the ratio to a percentage for display; for example, `0.3` is shown as `30%`. |

- Render `baseline_average` exactly as returned before presentation formatting. The API field does not guarantee an average of exactly three prior periods, so the UI must not describe it that way.
- When `alerts` is an empty array, render an explicit message such as “No anomaly alerts found for the selected filters.” Do not hide the table area or its containing section.

## Feature 3 — B2B vs B2C comparison

### `BusinessComparisonView`

**Responsibility:** Coordinate a new comparison page containing separate B2B and B2C category panels plus the total-income comparison chart.

#### Props

| Prop | TypeScript type | Purpose |
|---|---|---|
| `facets` | `FacetsResponse` | Supplies the global available category list. |
| `dateRange` | `DateRangeFilter` | The optional date range shared by all comparison requests. |
| `topCategoriesByBusinessType` | `Record<BusinessType, TopCategoriesResponse>` | Supplies each group's complete set of non-zero income categories for the current five-category contract. |
| `topCategoriesParamsByBusinessType` | `Record<BusinessType, TopCategoriesParams>` | Defines the income, limit-five, business-type, and optional date parameters for each top-category request. |

#### Layout and behavior

- Use a two-column panel layout on the new page, with one panel for each `BusinessType`: `B2B` and `B2C`.
- Each panel renders its own `TopCategoriesTable`. Derive each full group income by summing `CategoryEntry.total_amount` across that group's complete `TopCategoriesResponse`.
- Apply the same optional `dateRange` to the top-category parameters for both groups. If only one boundary exists, include only that boundary.
- The API defines exactly five categories. With `operation_type=income`, `limit=5`, and one `business_type`, each response therefore contains every category with a non-zero income total for that group; omitted categories contribute zero.
- Use `facets.categories` as the available category list. These facets are global; do not describe them as group-specific.
- Each panel independently shows an explicit empty state when its `TopCategoriesResponse` is empty. An empty group must not hide the other group, and a response containing fewer than five rows is valid.
- Render `IncomeComparisonChart` with the two top-category responses after the category panels.

### `TopCategoriesTable`

**Responsibility:** Render one business group's ranked income categories and each category's share of that group's full income.

#### Props

| Prop | TypeScript type | Purpose |
|---|---|---|
| `businessType` | `BusinessType` | Identifies whether the table belongs to the B2B or B2C panel. |
| `entries` | `TopCategoriesResponse` | Supplies every non-zero income category row for the group, ordered by total and limited to the five-category enum. |
| `availableCategories` | `FacetsResponse['categories']` | Supplies the global category choices, not group-specific facets. |

#### Layout and behavior

- Render category, total income, and percentage of the full group total for every returned row.
- Format `total_amount` as currency.
- Derive `groupTotalIncome` inside the table as `sum(entry.total_amount)` over `entries`, then derive each percentage as `total_amount / groupTotalIncome * 100`.
- When `groupTotalIncome` is zero, do not divide by zero; display the row percentage as `0%`.
- If `entries` is empty, show an explicit message for that panel, such as “No top income categories found for B2B.” Fewer than five rows is a valid result and must render without placeholder rows.

### `IncomeComparisonChart`

**Responsibility:** Compare total B2B income with total B2C income using the two complete top-category responses.

#### Props

| Prop | TypeScript type | Purpose |
|---|---|---|
| `topCategoriesByBusinessType` | `Record<BusinessType, TopCategoriesResponse>` | Supplies the complete non-zero category entries used to derive both chart values. |

#### Layout and behavior

- Render exactly two points or bars: B2B total income and B2C total income.
- Derive each value by summing `CategoryEntry.total_amount` across that business group's `TopCategoriesResponse`.
- Format chart values as currency.
- If both group arrays are empty, show an explicit comparison empty state instead of rendering a misleading zero-value chart. If only one array is empty, render that group's value as zero and keep the other group's value visible.

## Shared request states

For these components, show one concise loading message while required data is pending and one concise API failure message when a request fails; no additional status components or state machine are specified.
