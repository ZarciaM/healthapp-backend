import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { hasActiveAccess } from "../modules/dataSharing/dataSharing.service.js";
import type { SharingScope } from "../modules/dataSharing/dataSharing.types.js";

export function sharedAccessGuard(scope: SharingScope) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const ownerId = req.params.ownerId as string;
      const partnerId = req.user!.userId;

      if (ownerId === partnerId) {
        next();
        return;
      }

      const hasAccess = await hasActiveAccess(partnerId, ownerId, scope);

      if (!hasAccess) {
        next(ApiError.forbidden("You do not have access to this user's data"));
        return;
      }

      next();
    } catch (err) {
      next(ApiError.forbidden("Access verification failed"));
    }
  };
}
