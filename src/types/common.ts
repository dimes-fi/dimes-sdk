export interface Paginated<T> {
  data: T[];
  hasMore: boolean;
  /** Total matching records. Present only when the request includes `expand: ["total_count"]`. */
  totalCount?: number;
}
