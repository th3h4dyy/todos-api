import { check } from 'express-validator';
import { AppErrorCode } from '../../shared';

export const logoutUserValidator = [
  /* refresh_token field */
  check('refresh_token')
    .exists({ checkNull: true })
    .withMessage({
      code: AppErrorCode.IsRequired,
      title: 'Field value is required',
      detail: 'Refresh token is required <refresh_token>',
    })
    .isString()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Invalid field type',
      detail: 'Invalid refresh_token type, must be <string>',
    })
    .trim(),
];
