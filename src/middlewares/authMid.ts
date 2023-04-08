import AuthService from '@src/services/userAuth';
import { NextFunction, Request, Response } from 'express';

export function AuthMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  try {
    const token = req.headers?.['x-access-token'];
    const decoded = AuthService.decodeToken(token as string);
    req.decoded = decoded;
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status?.(401).send({ code: 401, error: err.message });
    } else {
      res.status?.(401).send({ code: 401, error: 'Unknown auth error' });
    }
  }
}
