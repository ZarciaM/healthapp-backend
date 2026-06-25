import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as weightService from "./weight.service.js";

export const recordEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const entry = await weightService.recordWeight(req.user!.userId, req.body);

    sendSuccess(res, 201, "Pesée enregistrée", { entry });
  },
);

export const getHistory = asyncHandler(
  async (req: Request, res: Response) => {
    let limit: number | undefined;
    if (req.query.limit !== undefined) {
      const parsed = Number(req.query.limit);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw ApiError.badRequest(
          "Le paramètre limit doit être un entier positif",
        );
      }
      limit = parsed;
    }

    let from: Date | undefined;
    if (req.query.from !== undefined) {
      const parsed = new Date(req.query.from as string);
      if (isNaN(parsed.getTime())) {
        throw ApiError.badRequest("La date from est invalide");
      }
      from = parsed;
    }

    let to: Date | undefined;
    if (req.query.to !== undefined) {
      const parsed = new Date(req.query.to as string);
      if (isNaN(parsed.getTime())) {
        throw ApiError.badRequest("La date to est invalide");
      }
      to = parsed;
    }

    if (from && to && from > to) {
      throw ApiError.badRequest(
        "La date de début (from) doit précéder la date de fin (to)",
      );
    }

    const entries = await weightService.getWeightHistory(req.user!.userId, {
      limit,
      from,
      to,
    });

    sendSuccess(res, 200, "Historique des pesées", { entries });
  },
);

export const getCurrent = asyncHandler(
  async (req: Request, res: Response) => {
    const entry = await weightService.getCurrentWeight(req.user!.userId);

    sendSuccess(res, 200, "Dernière pesée", { entry });
  },
);

export const setGoal = asyncHandler(async (req: Request, res: Response) => {
  const goal = await weightService.setGoal(req.user!.userId, req.body);

  sendSuccess(res, 200, "Objectif de poids enregistré", { goal });
});

export const getProgress = asyncHandler(
  async (req: Request, res: Response) => {
    const progress = await weightService.getProgress(req.user!.userId);

    sendSuccess(res, 200, "Progression récupérée", { progress });
  },
);
