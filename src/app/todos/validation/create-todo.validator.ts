import { check } from 'express-validator';
import { AppErrorCode } from '../../shared';

export const createTodoValidator = [
  check('title')
    .exists({ checkNull: true })
    .withMessage({
      code: AppErrorCode.IsRequired,
      title: 'Field value is required',
      detail: 'Todo title is required',
    })
    .trim()
    .isString()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Invalid field type',
      detail: 'Invalid title type, must be <string>',
    })
    .toLowerCase(),
  check('description')
    .optional()
    .trim()
    .isString()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Invalid field type',
      detail: 'Invalid description type, must be <string>',
    })
    .toLowerCase(),
  check('status').optional().isBoolean().withMessage({
    code: AppErrorCode.InvalidType,
    title: 'Invalid field type',
    detail: 'Invalid status type, must be <boolean>',
  }),
];
