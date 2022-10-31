import { AppErrorCode } from './app-error-codes.model';

export interface AppHttpResponseError {
  code?: AppErrorCode;
  source?: string;
  title?: string;
  detail?: string;
}
