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

export function BadRequest(res: Response, body?: AppHttpResponse): Response {
  return body ? res.status(HttpStatusCode.BadRequest).send(body) : res.status(HttpStatusCode.BadRequest).send();
}

export function Ok(res: Response, body?: AppHttpResponse): Response {
  return body ? res.status(HttpStatusCode.Ok).send(body) : res.status(HttpStatusCode.Ok).send();
}

/**
 *
 * Might be used in case of update or delete
 */
export function NoContent(res: Response): Response {
  return res.status(HttpStatusCode.NoContent).send();
}

export function NotFound(res: Response, body?: AppHttpResponse): Response {
  return body ? res.status(HttpStatusCode.NotFound).send(body) : res.status(HttpStatusCode.NotFound).send();
}

export function Created(res: Response, body?: AppHttpResponse): Response {
  return body ? res.status(HttpStatusCode.Created).send(body) : res.status(HttpStatusCode.Created).send();
}

export function UnAuthenticated(res: Response, body?: AppHttpResponse): Response {
  return body
    ? res.status(HttpStatusCode.UnAuthenticated).send(body)
    : res.status(HttpStatusCode.UnAuthenticated).send();
}

export function Forbidden(res: Response, body?: AppHttpResponse): Response {
  return body ? res.status(HttpStatusCode.Forbidden).send(body) : res.status(HttpStatusCode.Forbidden).send();
}
