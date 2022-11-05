import { check } from 'express-validator';
import { AppErrorCode } from '../../shared';

export const forgotPasswordValidator = [
  /* email field */
  check('email')
    .exists({ checkNull: true })
    .withMessage({
      code: AppErrorCode.IsRequired,
      title: 'Field value is required',
      detail: 'User email is required',
    })
    .isEmail()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Invalid field type',
      detail: 'Invalid email type, must be <email>',
    })
    .trim()
    .toLowerCase(),
];
