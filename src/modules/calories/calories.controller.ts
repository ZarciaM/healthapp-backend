import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import * as caloriesService from "./calories.service.js";

export const calculate = asyncHandler(async (req: Request, res: Response) => {
  const { weight, height } = req.query as unknown as {
    weight?: number;
    height?: number;
  };
  const overrides: { weight?: number; height?: number } = {};
  if (weight !== undefined) overrides.weight = weight;
  if (height !== undefined) overrides.height = height;

  const result = await caloriesService.calculateDailyCalories(
    req.user!.userId,
    overrides,
  );

  sendSuccess(res, 200, "Besoins caloriques calculés", { result });
});
