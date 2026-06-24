import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw ApiError.unauthorized("Token d'accès manquant");
  }

  const payload = verifyAccessToken(token);
  req.user = { userId: payload.userId };
  next();
}
