import { check } from 'express-validator';
import { AppErrorCode } from '../../shared';
export const updateTodoValidator = [
  /* id field */
  check('id')
    .exists({ checkNull: true })
    .withMessage({
      code: AppErrorCode.IsRequired,
      title: 'Field value is required',
      detail: 'Todo id is required',
    })
    .isInt({ gt: 0 })
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Invalid field type',
      detail: 'Invalid id type, must be <integer> and greater than 0',
    }),
  /* title field */
  check('title')
    .optional()
    .isString()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Invalid field type',
      detail: 'Invalid title type, must be <string>',
    })
    .trim()
    .toLowerCase(),
  /* description field */
  check('description')
    .optional()
    .isString()
    .withMessage({
      code: AppErrorCode.InvalidType,
      title: 'Invalid field type',
      detail: 'Invalid description type, must be <string>',
    })
    .trim()
    .toLowerCase(),
  /* status field */
  check('status').optional().isBoolean().withMessage({
    code: AppErrorCode.InvalidType,
    title: 'Invalid field type',
    detail: 'Invalid status type, must be <boolean>',
  }),
  /* user_id field */
  check('user_id').optional().isInt({ gt: 0 }).withMessage({
    code: AppErrorCode.InvalidType,
    title: 'Invalid field type',
    detail: 'Invalid user_id type, must be <integer> and greater than 0',
  }),
];
