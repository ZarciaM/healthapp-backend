import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import User from "../modules/user/user.model.js";

export function genderGuard(allowedGenders: ("male" | "female")[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user!.userId).select("gender");

      if (!user || !user.gender) {
        next(ApiError.forbidden("Profil incomplet"));
        return;
      }

      if (!allowedGenders.includes(user.gender)) {
        next(
          ApiError.forbidden(
            "Cette fonctionnalité n'est pas disponible pour votre profil",
          ),
        );
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
