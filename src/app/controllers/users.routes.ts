import { Router, Request, Response, NextFunction } from 'express';
import { BadRequest, Ok } from '../shared';
import { CreateUserInput, UsersDataAccess } from '../users/';

export const usersRouter = Router();

export const usersRelativeRoute = 'users';

/**
 * Create user route
 * route: /api/users/signup
 */
usersRouter.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
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
