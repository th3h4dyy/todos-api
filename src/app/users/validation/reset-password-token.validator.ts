import { body, param } from 'express-validator';
import { AppErrorCode } from '../../shared';

export const resetPasswordTokenValidator = [
  /* token field */
  param('token')
    .exists({ checkNull: true })
    .withMessage({
      code: AppErrorCode.IsRequired,
      title: 'Field value is required',
      detail: 'Reset password token is required',
    })
    .isString()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Invalid field type',
      detail: 'Invalid token type, must be <string>',
    })
    .trim(),

  /* password field */
  body('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage({
      code: AppErrorCode.IsRequired,
      title: 'Field value is required',
      detail: 'Password is required',
    })
    .isString()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Invalid field type',
      detail: 'Invalid password type, must be <string>',
    })
    .trim(),
];
