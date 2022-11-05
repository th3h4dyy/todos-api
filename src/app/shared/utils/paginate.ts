/**
 * solve the pagination problem and calculate the offset and limit
 * @param {number} page current page
 * @param {number} pageSize maximum number of items allowed per page
 * @returns {Paginate} offset and limit
 */

export function paginate(page: number, pageSize: number): { offset: number; limit: number } {
  const pagination = { offset: 0, limit: 0 };
  pagination.limit = Math.abs(pageSize) || 0;
  page = (Math.abs(page) || 1) - 1;
  pagination.offset = pagination.limit * page;
  return pagination;
}
