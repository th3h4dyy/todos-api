import jwt from 'jsonwebtoken';
import { JWTRESULT } from '../models/jwt-result.model';

export async function signToken(payload: string | object, key: jwt.Secret, options: jwt.SignOptions) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, key, options, (err: Error | null, encoded: string | undefined) =>
      err ? reject(err) : resolve(encoded)
    );
  });
}

export async function verifyToken(token: string, key: jwt.Secret): Promise<JWTRESULT> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, key, (err, decoded) => (err ? reject(err) : resolve(decoded as JWTRESULT)));
  });
}
