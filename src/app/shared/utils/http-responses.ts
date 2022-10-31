import { Response } from 'express';
import { AppErrorCode, AppHttpResponse, HttpStatusCode } from '../models';

export function InternalServerError(res: Response, error: string | Error): Response {
  const body: AppHttpResponse = {
    errors: [
      {
        code: AppErrorCode.InternalServerError,
        title: 'Internal server error',
        detail: error instanceof Error ? error.message : error,
      },
    ],
  };
  return res.status(HttpStatusCode.InternalServerError).send(body);
}
