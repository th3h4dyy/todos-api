import { Request, Response, NextFunction } from 'express';
import { User } from '../db';
import { AppErrorCode, DataResult } from '../models';
import { BadRequest, UnAuthenticated, verifyToken } from '../utils';

export async function protect(req: Request, res: Response, next: NextFunction) {
  const result: DataResult<Record<string, unknown>> = {};
  // check if the token is set.
  try {
    if (req.headers.authorization?.startsWith('Bearer')) {
      const accessToken = req.headers.authorization.split(' ')[1] || '';
      result.data = { accessToken };
    } else {
      return BadRequest(res, {
        errors: [
          {
            source: 'token',
            code: AppErrorCode.IsRequired,
            title: 'Field is not found',
            detail: 'Authorization header does not contain access token: <Bearer ACESS_TOKEN>',
          },
        ],
      });
    }
    // verify token
    const decoded = await verifyToken(result.data.accessToken as string, process.env.JWT_SECRET as string);
    // check if user who issued the token is still exists
    const currentUser = await User.findOne({ where: { id: decoded.id } });
    if (!currentUser) {
      return UnAuthenticated(res, {
        errors: [
          {
            code: AppErrorCode.ValueNotExist,
            title: 'Field is not found',
            detail: 'The user belonging to this token does no longer exist.',
          },
        ],
      });
    }
    // check if user changed password after the token was issued
    if (await currentUser.changedPasswordAfter(decoded)) {
      return UnAuthenticated(res, {
        errors: [
          {
            code: AppErrorCode.ValueNotExist,
            title: 'Field is not found',
            detail: 'User recently changed password! Please log in again.',
          },
        ],
      });
    }
    req.user = currentUser;
    next();
  } catch (error) {
    result.error = error as Error;
    // catch the jwt malformed error
    if (result.error?.message === 'jwt malformed' || result.error?.message === 'jwt expired') {
      return UnAuthenticated(res, {
        errors: [
          {
            code: AppErrorCode.InvalidType,
            title: 'Field is not valid or expired',
            detail: 'The token is not valid or expired.',
          },
        ],
      });
    }
  }
  return result;
}
