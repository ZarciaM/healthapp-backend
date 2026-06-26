import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import * as medicationService from "./medication.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const reminder = await medicationService.createReminder(req.user!.userId, req.body);

  sendSuccess(res, 201, "Medication reminder created", { reminder });
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const activeOnly = req.query.activeOnly === "true";

  const reminders = await medicationService.getReminders(req.user!.userId, { activeOnly });

  sendSuccess(res, 200, "Medication reminders retrieved", { reminders });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const reminder = await medicationService.updateReminder(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  sendSuccess(res, 200, "Medication reminder updated", { reminder });
});

export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  await medicationService.deactivateReminder(req.user!.userId, req.params.id as string);

  sendSuccess(res, 200, "Medication reminder deactivated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await medicationService.deleteReminder(req.user!.userId, req.params.id as string);

  sendSuccess(res, 200, "Medication reminder deleted");
});
