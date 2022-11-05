import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  AppErrorCode,
  BadRequest,
  Created,
  CustomValidationErrorFormatter,
  Database,
  Forbidden,
  NoContent,
  NotFound,
  Ok,
  protect,
  signToken,
  UnAuthenticated,
  User,
  verifyToken,
} from '../shared';
import {
  CreateUserInput,
  LoginUserInput,
  UsersDataAccess,
  createUserValidator,
  updateUserValidator,
  logoutUserValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordTokenValidator,
} from '../users';
import { validationResult } from 'express-validator';
import { Op, QueryTypes } from 'sequelize';

export const usersRouter = Router();

export const usersRelativeRoute = 'users';

/**
 * TODO: Refactor all the auth handlers into their own routes [signup, login, logout, refresh-token, etc]
 * /api/auth/signup
 * /api/auth/login
 * /api/auth/logout
 * /api/auth/refresh-token
 * /api/auth/forgot-password
 * /api/auth/reset-password
 * [+] send the token as a cookie with samesite=strict and httpOnly=true and secure=true
 */

/**
 * Signup user route
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
      Created(res, { data: result.data });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Login user route
 * route: /api/users/login
 */
usersRouter.post('/login', createUserValidator, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationErrors = validationResult(req)
      .formatWith(CustomValidationErrorFormatter)
      .array({ onlyFirstError: true });
    if (validationErrors.length) {
      return BadRequest(res, { errors: validationErrors });
    }
    const data: LoginUserInput = req.body;
    const result = await UsersDataAccess.login(data);
    if (result.error) {
      next(result.error);
    } else if (result.validationErrors?.length) {
      UnAuthenticated(res, { errors: result.validationErrors });
    } else {
      Ok(res, { data: result.data });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Logout user route
 * route: /api/users/logout
 */

usersRouter.post('/logout', logoutUserValidator, protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationErrors = validationResult(req)
      .formatWith(CustomValidationErrorFormatter)
      .array({ onlyFirstError: true });
    if (validationErrors.length) {
      return BadRequest(res, { errors: validationErrors });
    }
    const result = await UsersDataAccess.logout(req.body['refresh_token']);
    if (result.error) {
      console.log('ERRRRRRRRRRRRRRRRRRROR');
      next(result.error);
    } else if (result.validationErrors?.length) {
      Forbidden(res, { errors: result.validationErrors });
    } else {
      Ok(res);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Get a new access token route
 * route: /api/users/refresh-token
 */
usersRouter.post('/refresh-token', refreshTokenValidator, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationErrors = validationResult(req)
      .formatWith(CustomValidationErrorFormatter)
      .array({ onlyFirstError: true });
    if (validationErrors.length) {
      return BadRequest(res, { errors: validationErrors });
    }
    const decoded = await verifyToken(req.body['refresh_token'], process.env.JWT_REFRESH_TOKEN_SECRET as string);
    const result: { id: number }[] = await Database.sequelize.query(
      'SELECT "id" FROM users WHERE "refreshToken" = :refresh_token',
      {
        replacements: { refresh_token: req.body['refresh_token'] },
        type: QueryTypes.SELECT,
      }
    );
    if (!result.length) {
      Forbidden(res, {
        errors: [
          {
            code: AppErrorCode.ValueNotExist,
            title: 'Invalid token',
            detail: 'Invalid refresh token',
          },
        ],
      });
    }

    // sign a new access token
    const accessToken = await signToken({ id: decoded.id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    Ok(res, { data: { access_token: accessToken } });
  } catch (error) {
    next(error);
  }
});

/**
 * forgot password route
 * route: /api/users/forgot-password
 */
usersRouter.post(
  '/forgot-password',
  forgotPasswordValidator,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationErrors = validationResult(req).formatWith(CustomValidationErrorFormatter).array({
        onlyFirstError: true,
      });
      if (validationErrors.length) {
        return BadRequest(res, { errors: validationErrors });
      }
      // Get user based on POSTed email
      const user = await User.findOne({
        where: {
          email: req.body.email,
        },
      });
      if (!user) {
        return NotFound(res, {
          errors: [
            {
              code: AppErrorCode.ValueNotExist,
              title: 'User not found',
              detail: 'There is no user with email address.',
            },
          ],
        });
      }
      // Generate the random reset token [create an instance method on the user model]
      const resetToken = user.createPasswordResetToken();
      await user.save({ validate: false });
      //TODO: send it to user's email [might use nodemailer or sendgrid] later.
      Ok(res, { data: { resetToken } });
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post(
  '/reset-password/:token',
  resetPasswordTokenValidator,
  async (req: Request, res: Response, next: NextFunction) => {
    // will recieve the reset token and the new password
    try {
      const validationErrors = validationResult(req).formatWith(CustomValidationErrorFormatter).array({
        onlyFirstError: true,
      });
      if (validationErrors.length) {
        return BadRequest(res, { errors: validationErrors });
      }
      // create a hashed token and compare it with the hashed token in the database
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
      const user = await User.findOne({
        where: {
          passwordResetToken: hashedToken,
          passwordResetExpires: {
            [Op.gt]: Date.now(),
          },
        },
      });
      // If token has not expired, and there is user, set the new password
      if (!user) {
        return BadRequest(res, {
          errors: [
            {
              code: AppErrorCode.ValueNotExist,
              title: 'Token is invalid or has expired',
              detail: 'Token is invalid or has expired',
            },
          ],
        });
      }
      user.password = req.body.password;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
      // Log the user in, send JWT
      const token = await signToken({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      const refreshToken = (await signToken(
        { id: user.id },
        process.env.JWT_REFRESH_TOKEN_SECRET as string,
        {}
      )) as string;
      await user.update({ refreshToken });
      Ok(res, { data: { access_token: token, refresh_token: refreshToken } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update user route
 * route: /api/users/:id
 */
usersRouter.put('/:id', updateUserValidator, protect, async (req: Request, res: Response, next: NextFunction) => {
  const validationErrors = validationResult(req)
    .formatWith(CustomValidationErrorFormatter)
    .array({ onlyFirstError: true });
  if (validationErrors.length) {
    return BadRequest(res, { errors: validationErrors });
  }
  try {
    const userParamId = Number.parseInt(req.params.id);
    if (+req.user.id !== userParamId) {
      return Forbidden(res, {
        errors: [
          {
            code: AppErrorCode.Forbidden,
            title: 'Forbidden',
            detail: 'You are not allowed to update this user',
          },
        ],
      });
    }
    const result = await UsersDataAccess.update({ ...req.body, id: userParamId });
    if (result.error) {
      next(result.error);
    } else if (result.isNotFound) {
      NotFound(res);
    } else if (result.validationErrors?.length) {
      BadRequest(res, { errors: result.validationErrors });
    } else {
      NoContent(res);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Delete user route
 * route: /api/users/:id
 */
usersRouter.delete('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check if the user is trying to delete himself
    const userParamId = Number.parseInt(req.params.id);
    if (+req.user.id !== userParamId) {
      return Forbidden(res, {
        errors: [
          {
            code: AppErrorCode.Forbidden,
            title: 'Forbidden',
            detail: 'You are not allowed to delete this user',
          },
        ],
      });
    }
    const result = await UsersDataAccess.delete(userParamId);
    if (result.error) {
      next(result.error);
    } else if (result.isNotFound) {
      NotFound(res);
    } else {
      NoContent(res);
    }
  } catch (error) {
    next(error);
  }
});
