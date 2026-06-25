import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as bloodPressureService from "./bloodPressure.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const entry = await bloodPressureService.createEntry(
    req.user!.userId,
    req.body,
  );

  sendSuccess(res, 201, "Entrée de pression artérielle créée", { entry });
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

  const entries = await bloodPressureService.getHistory(req.user!.userId, {
    limit,
    from,
    to,
  });

  sendSuccess(res, 200, "Historique récupéré", { entries });
});

export const getLatest = asyncHandler(async (req: Request, res: Response) => {
  const entry = await bloodPressureService.getLatest(req.user!.userId);

  sendSuccess(res, 200, "Dernière entrée de pression artérielle", { entry });
});

export const getAverages = asyncHandler(async (req: Request, res: Response) => {
  let days = 7;
  if (req.query.days !== undefined) {
    const parsed = Number(req.query.days);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw ApiError.badRequest("Le paramètre days doit être un entier positif");
    }
    days = parsed;
  }

  const averages = await bloodPressureService.getAverages(
    req.user!.userId,
    days,
  );

  sendSuccess(res, 200, "Moyennes de pression artérielle", { averages });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await bloodPressureService.deleteEntry(
    req.user!.userId,
    req.params.id as string,
  );

  sendSuccess(res, 200, "Entrée de pression artérielle supprimée");
});
