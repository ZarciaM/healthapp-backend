import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as cycleService from "./menstrualCycle.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const entry = await cycleService.createEntry(req.user!.userId, req.body);

  sendSuccess(res, 201, "Cycle entry created", { entry });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.params.ownerId as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate as string) : undefined;
  const toDate = req.query.toDate ? new Date(req.query.toDate as string) : undefined;

  const entries = await cycleService.getHistory(ownerId, {
    limit,
    fromDate,
    toDate,
  });

  sendSuccess(res, 200, "Cycle history retrieved", { entries });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.params.ownerId as string;

  if (req.user!.userId !== ownerId) {
    throw ApiError.forbidden("You can only delete your own cycle entries");
  }

  await cycleService.deleteEntry(ownerId, req.params.id as string);

  sendSuccess(res, 200, "Cycle entry deleted");
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.params.ownerId as string;
  const stats = await cycleService.getCycleStats(ownerId);

  sendSuccess(res, 200, "Cycle stats retrieved", { stats });
});

export const getPrediction = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.params.ownerId as string;
  const result = await cycleService.predictNextPeriod(ownerId);

  if ("error" in result) {
    throw ApiError.badRequest(result.error);
  }

  sendSuccess(res, 200, "Next period prediction", result);
});

export const getFertileWindow = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.params.ownerId as string;
  const result = await cycleService.predictFertileWindowFn(ownerId);

  if ("error" in result) {
    throw ApiError.badRequest(result.error);
  }

  sendSuccess(res, 200, "Fertile window prediction", result);
});
