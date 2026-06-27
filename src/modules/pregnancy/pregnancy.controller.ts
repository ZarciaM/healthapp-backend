import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import * as pregnancyService from "./pregnancy.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const profile = await pregnancyService.createProfile(req.user!.userId, req.body);

  sendSuccess(res, 201, "Pregnancy profile created", { pregnancy: profile });
});

export const getCurrent = asyncHandler(async (req: Request, res: Response) => {
  const pregnancy = await pregnancyService.getCurrentPregnancy(req.user!.userId);

  if (!pregnancy) {
    sendSuccess(res, 200, "No active pregnancy");
    return;
  }

  sendSuccess(res, 200, "Active pregnancy retrieved", { pregnancy });
});

export const getProgress = asyncHandler(async (req: Request, res: Response) => {
  const result = await pregnancyService.getProgress(req.user!.userId);

  if ("error" in result) {
    throw ApiError.notFound(result.error);
  }

  sendSuccess(res, 200, "Pregnancy progress retrieved", {
    pregnancy: result.pregnancy,
    gestationalAge: result.gestationalAge,
    daysUntilDueDate: result.daysUntilDueDate,
    currentMilestone: result.currentMilestone,
  });
});

export const close = asyncHandler(async (req: Request, res: Response) => {
  const profile = await pregnancyService.closePregnancy(req.user!.userId, req.params.id as string);

  sendSuccess(res, 200, "Pregnancy profile closed", { pregnancy: profile });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const profiles = await pregnancyService.getHistory(req.user!.userId);

  sendSuccess(res, 200, "Pregnancy history retrieved", { pregnancies: profiles });
});
