import { check } from 'express-validator';
import { AppErrorCode } from '../../shared';

export const updateUserValidator = [
  /** email field */
  check('email').optional().toLowerCase().isEmail().withMessage({
    code: AppErrorCode.InvalidType,
    title: 'Invalid field data',
    detail: 'Email is not valid',
  }),
  /** password field */
  check('password').optional().isString().withMessage({
    code: AppErrorCode.InvalidType,
    title: 'Invalid field data',
    detail: 'Password is not valid',
  }),
  /** firstName field */
  check('firstName').optional().trim().isString().withMessage({
    code: AppErrorCode.InvalidType,
    title: 'Invalid field data',
    detail: 'First name is not valid',
  }),
  /** lastName field */
  check('lastName').optional().trim().isString().withMessage({
    code: AppErrorCode.InvalidType,
    title: 'Invalid field data',
    detail: 'Last name is not valid',
  }),
];
