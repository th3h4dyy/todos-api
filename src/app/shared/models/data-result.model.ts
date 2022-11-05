import { AppHttpResponseError } from './app-http-response-error.model';
import { PaginationInfo } from './pagination-info.model';

/**
 * Data Access layer for operation result.
 */
export interface DataResult<Type> {
  data?: Type | null;
  validationErrors?: AppHttpResponseError[];
  paginationInfo?: PaginationInfo;
  isNotFound?: boolean;
  error?: Error;
}
