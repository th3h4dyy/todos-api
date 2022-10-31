import { check } from 'express-validator';
import { AppErrorCode } from '../../shared';

export const createUserValidator = [
  check('email')
    .exists({ checkNull: true })
    .withMessage({
      code: AppErrorCode.IsRequired,
      title: 'Field is required',
      detail: 'Email is required',
    })
    .trim()
    .isEmail()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Field type is invalid',
      detail: 'Email is invalid',
    }),
  check('password').exists({ checkNull: true }).withMessage({
    code: AppErrorCode.IsRequired,
    title: 'Field is required',
    detail: 'Password is required',
  }),
];
