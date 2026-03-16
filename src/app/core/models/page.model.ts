export interface PageResult<T> {
  totalPages: number;
  totalResults: number;
  result: T[];
}

export interface PageParams {
  page?: number;
  itemsPerPage?: number;
  sort?: 'ASC' | 'DESC';
  sortName?: string;
}
