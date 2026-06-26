import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as bodyFatService from "./bodyFat.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const entry = await bodyFatService.createEntry(req.user!.userId, req.body);

  sendSuccess(res, 201, "Mesure de graisse corporelle enregistrée", { entry });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  let limit: number | undefined;
  if (req.query.limit !== undefined) {
    const parsed = Number(req.query.limit);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw ApiError.badRequest("Le paramètre limit doit être un entier positif");
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

  if (from !== undefined && to !== undefined && from > to) {
    throw ApiError.badRequest("La date from doit être antérieure à la date to");
  }

  const entries = await bodyFatService.getHistory(req.user!.userId, {
    limit,
    from,
    to,
  });

  sendSuccess(res, 200, "Historique récupéré", { entries });
});

export const getLatest = asyncHandler(async (req: Request, res: Response) => {
  const entry = await bodyFatService.getLatest(req.user!.userId);

  sendSuccess(res, 200, "Dernière mesure de graisse corporelle", { entry });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await bodyFatService.deleteEntry(
    req.user!.userId,
    req.params.id as string,
  );

  sendSuccess(res, 200, "Mesure de graisse corporelle supprimée");
});
