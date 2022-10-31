import { Response } from 'express';
import { AppErrorCode, AppHttpResponse, AppHttpResponseError, HttpStatusCode } from '../models';

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

export function BadRequest(res: Response, body?: AppHttpResponse): Response {
  return body ? res.status(HttpStatusCode.BadRequest).send(body) : res.status(HttpStatusCode.BadRequest).send();
}

export function Ok(res: Response, body?: AppHttpResponse): Response {
  return body ? res.status(HttpStatusCode.Ok).send(body) : res.status(HttpStatusCode.Ok).send();
}
