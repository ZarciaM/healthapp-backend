import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import * as caloriesService from "./calories.service.js";

export const calculate = asyncHandler(async (req: Request, res: Response) => {
  const { weight, height } = req.query as { weight?: string; height?: string };
  const overrides: { weight?: number; height?: number } = {};
  if (weight !== undefined) overrides.weight = Number(weight);
  if (height !== undefined) overrides.height = Number(height);

  const result = await caloriesService.calculateDailyCalories(
    req.user!.userId,
    overrides,
  );

  sendSuccess(res, 200, "Besoins caloriques calculés", { result });
});
