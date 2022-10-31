import { AppHttpResponseMeta } from './app-http-response-meta.model';
import { AppHttpResponseError } from './app-http-response-error.model';

export interface AppHttpResponse {
  data?: unknown;

  meta?: AppHttpResponseMeta;

  errors?: AppHttpResponseError[];
}
