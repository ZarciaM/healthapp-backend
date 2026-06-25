import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import * as bmiService from "./bmi.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const entry = await bmiService.createEntry(req.user!.userId, req.body);

  sendSuccess(res, 201, "Entrée IMC créée", { entry });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;

  const entries = await bmiService.getHistory(req.user!.userId, {
    limit,
    from,
    to,
  });

  sendSuccess(res, 200, "Historique récupéré", { entries });
});

export const getLatest = asyncHandler(async (req: Request, res: Response) => {
  const entry = await bmiService.getLatest(req.user!.userId);

  sendSuccess(res, 200, "Dernière entrée IMC", { entry });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await bmiService.deleteEntry(req.user!.userId, req.params.id as string);

  sendSuccess(res, 200, "Entrée IMC supprimée");
});
