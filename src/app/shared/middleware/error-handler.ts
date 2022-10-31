import { Request, Response, NextFunction } from 'express';
import { InternalServerError } from '../utils';

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
  console.log(error.message, error);
  InternalServerError(res, error);
}
