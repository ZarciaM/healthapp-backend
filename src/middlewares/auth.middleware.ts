import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../modules/user/user.model.js";

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.accessToken;

  if (!token) {
    next(ApiError.unauthorized("Authentification requise"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId).select("tokenVersion").lean();

    if (!user || (user.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) {
      next(ApiError.unauthorized("Session expirée ou invalide"));
      return;
    }

    req.user = { userId: payload.userId };
    next();
  } catch {
    next(ApiError.unauthorized("Session expirée ou invalide"));
  }
}
