import type { BusinessType } from './api-types'

/** Optional inclusive date boundaries shared by the feature's analytics requests. */
export interface DateRangeFilter {
  /** Inclusive first date in `YYYY-MM-DD` format. */
  start_date?: string
  /** Inclusive last date in `YYYY-MM-DD` format. */
  end_date?: string
}

/** Query parameters used by the feature's alerts request. */
export interface AlertsParams extends DateRangeFilter {
  /** Alert ratio threshold; the PM/UI range is `0.01..1.0` with `0.3` as its default, while the API accepts numbers greater than or equal to `0` with no maximum. */
  threshold: number
}

/** Query parameters used by the feature's income top-categories request. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Feature-specific operation direction, fixed to income. */
  operation_type: 'income'
  /** Feature-specific number of ranked categories, fixed to five. */
  limit: 5
  /** Required business segment: `B2B` or `B2C`. */
  business_type: BusinessType
}

/** Query parameters used by the feature's income summary request. */
export interface SummaryParams extends DateRangeFilter {
  /** Feature-specific operation direction, fixed to income. */
  operation_type: 'income'
  /** Required business segment: `B2B` or `B2C`; the omitted API `group_by` parameter defaults to monthly grouping. */
  business_type: BusinessType
}
