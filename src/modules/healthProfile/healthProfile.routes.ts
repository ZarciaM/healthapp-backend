import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { ApiError } from "../../utils/ApiError.js";
import { getStepSchema } from "./healthProfile.validation.js";
import User from "../user/user.model.js";
import * as controller from "./healthProfile.controller.js";

const router = Router();

router.get("/", authMiddleware, controller.getMyProfile);

router.post(
  "/step/:step",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const step = parseInt(req.params.step as string, 10);

      if (isNaN(step) || step < 1 || step > 5) {
        throw ApiError.badRequest("Étape invalide");
      }

      const user = await User.findById(req.user!.userId).select("gender");

      if (!user) {
        throw ApiError.notFound("Utilisateur introuvable");
      }

      const gender = (user.gender ?? "male") as "male" | "female";
      const schema = getStepSchema(step, gender);

      const result = schema.safeParse(req.body);

      if (!result.success) {
        throw ApiError.badRequest("Validation échouée", result.error.issues);
      }

      req.body = result.data;
      res.locals.gender = gender;
      next();
    } catch (error) {
      next(error);
    }
  },
  controller.submitOnboardingStep,
);

export default router;
