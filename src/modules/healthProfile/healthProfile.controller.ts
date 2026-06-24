import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as healthProfileService from "./healthProfile.service.js";

export const getMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await healthProfileService.getOrCreateProfile(
      req.user!.userId,
    );

    sendSuccess(res, 200, "Profil récupéré", { profile });
  },
);

export const submitOnboardingStep = asyncHandler(
  async (req: Request, res: Response) => {
    const step = parseInt(req.params.step as string, 10);

    if (isNaN(step) || step < 1 || step > 5) {
      throw ApiError.badRequest("Étape invalide");
    }

    const profile = await healthProfileService.submitStep(
      req.user!.userId,
      step,
      req.body,
      res.locals.gender as "male" | "female",
    );

    sendSuccess(res, 200, "Étape enregistrée", { profile });
  },
);
