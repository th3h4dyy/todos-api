import { PaginationInfo } from '../models';

export function genPaginationInfo(
  page: number,
  pageSize: number,
  itemsTotalCount: number,
  itemsCount: number
): PaginationInfo {
  const totalPages = Math.ceil(itemsTotalCount / pageSize);

  return {
    page,
    pageSize,
    count: itemsCount,
    total: itemsTotalCount,
    previousPage: page - 1 ? page - 1 : undefined,
    nextPage: totalPages > page ? page + 1 : undefined,
    totalPages,
  };
}
