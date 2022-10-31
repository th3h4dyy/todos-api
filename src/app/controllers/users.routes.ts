import { Router, Request, Response, NextFunction } from 'express';
import { BadRequest, CustomValidationErrorFormatter, Ok } from '../shared';
import { CreateUserInput, UsersDataAccess } from '../users/';
import { createUserValidator } from '../users/validation';
import { validationResult } from 'express-validator';

export const usersRouter = Router();

export const usersRelativeRoute = 'users';

/**
 * Create user route
 * route: /api/users/signup
 */
usersRouter.post('/signup', createUserValidator, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationErrors = validationResult(req)
      .formatWith(CustomValidationErrorFormatter)
      .array({ onlyFirstError: true });
    if (validationErrors.length) {
      return BadRequest(res, { errors: validationErrors });
    }
    const data: CreateUserInput = req.body;
    const result = await UsersDataAccess.create(data);
    if (result.error) {
      next(result.error);
    } else if (result.validationErrors?.length) {
      BadRequest(res, { errors: result.validationErrors });
    } else {
      Ok(res, { data: result.data });
    }
  } catch (error) {
    next(error);
  }
});
