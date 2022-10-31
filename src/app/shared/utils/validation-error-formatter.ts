import { ValidationError } from 'express-validator';
import { AppHttpResponseError } from '../models';

export function CustomValidationErrorFormatter(expressValidatorError: ValidationError): AppHttpResponseError {
  const appErr: AppHttpResponseError = expressValidatorError.msg ? expressValidatorError.msg : {};
  appErr.source = expressValidatorError.param;
  return appErr;
}
