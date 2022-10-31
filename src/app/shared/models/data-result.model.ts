import { AppHttpResponseError } from './app-http-response-error.model';

/**
 * Data Access layer for operation result.
 */
export interface DataResult<Type> {
  data?: Type;
  validationErrors?: AppHttpResponseError[];
  isNotFound?: boolean;
  error?: Error;
}
