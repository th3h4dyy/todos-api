import { check } from 'express-validator';
import { AppErrorCode } from '../../shared';

export const createUserValidator = [
  /* Email field */
  check('email')
    .exists({ checkNull: true })
    .withMessage({
      code: AppErrorCode.IsRequired,
      title: 'Field is required',
      detail: 'Email is required',
    })
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Field type is invalid',
      detail: 'Email is invalid',
    }),
  /* password field */
  check('password')
    .exists({ checkNull: true })
    .withMessage({
      code: AppErrorCode.IsRequired,
      title: 'Field is required',
      detail: 'Password is required',
    })
    .isString()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Field type is invalid',
      detail: 'Password is invalid',
    }),
];
