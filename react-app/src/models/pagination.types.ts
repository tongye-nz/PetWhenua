export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  posts: T[];
  pagination: PaginationInfo;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
} 