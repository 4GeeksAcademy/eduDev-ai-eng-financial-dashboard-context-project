/** Operation direction returned by the API: money entering (`income`) or leaving (`outcome`). */
export type OperationType = 'income' | 'outcome'

/** Business segment returned by the API: business-to-business (`B2B`) or business-to-consumer (`B2C`). */
export type BusinessType = 'B2B' | 'B2C'

/** Financial category returned by the API. */
export type Category =
  | 'suppliers'
  | 'sales'
  | 'operational'
  | 'administrative'
  | 'others'

/** Available filter values and date boundaries returned by the facets endpoint. */
export interface FacetsResponse {
  /** Operation values currently available: `income` and/or `outcome`. */
  operation_types: OperationType[]
  /** Business segment values currently available: `B2B` and/or `B2C`. */
  business_types: BusinessType[]
  /** Financial category values currently available from the five-category enum. */
  categories: Category[]
  /** Earliest available movement date in `YYYY-MM-DD` format. */
  min_date: string
  /** Latest available movement date in `YYYY-MM-DD` format. */
  max_date: string
}

/** One outcome alert returned for an API reporting period. */
export interface AlertEntry {
  /** Grouped period label, such as `YYYY-MM` when the API uses its default monthly grouping. */
  period: string
  /** Total outcome amount for the period. */
  outcome_total: number
  /** Average outcome amount from the prior periods considered by the API; this field does not guarantee exactly three prior periods. */
  baseline_average: number
  /** Decimal increase over the baseline, where `0.3` means a 30% increase. */
  increase_ratio: number
}

/** Raw array returned by the alerts endpoint, without a response wrapper. */
export type AlertsResponse = AlertEntry[]

/** One ranked category total returned by the top-categories endpoint. */
export interface CategoryEntry {
  /** Category name from the API's five-category enum. */
  category: Category
  /** Operation direction represented by this total: `income` or `outcome`. */
  operation_type: OperationType
  /** Aggregated amount for the category and operation direction. */
  total_amount: number
}

/** Raw array returned by the top-categories endpoint, without a response wrapper. */
export type TopCategoriesResponse = CategoryEntry[]
