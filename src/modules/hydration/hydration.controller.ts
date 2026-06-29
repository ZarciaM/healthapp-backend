import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import * as hydrationService from "./hydration.service.js";

export const createOrUpdate = asyncHandler(async (req: Request, res: Response) => {
  const reminder = await hydrationService.createOrUpdateReminder(
    req.user!.userId,
    req.body,
  );

  sendSuccess(res, 200, "Hydration reminder saved", { reminder });
});

export const getReminder = asyncHandler(async (req: Request, res: Response) => {
  const reminder = await hydrationService.getReminder(req.user!.userId);

  sendSuccess(res, 200, "Hydration reminder retrieved", { reminder });
});

export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  await hydrationService.deactivate(req.user!.userId);

  sendSuccess(res, 200, "Hydration reminder deactivated");
});

export const reactivate = asyncHandler(async (req: Request, res: Response) => {
  const reminder = await hydrationService.reactivate(req.user!.userId);

  sendSuccess(res, 200, "Hydration reminder reactivated", { reminder });
});

export const deleteReminder = asyncHandler(async (req: Request, res: Response) => {
  await hydrationService.deleteReminder(req.user!.userId);

  sendSuccess(res, 200, "Hydration reminder deleted");
});
