export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface LaravelPagination<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
