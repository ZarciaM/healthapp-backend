import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import * as waterService from "./water.service.js";

export const calculate = asyncHandler(async (req: Request, res: Response) => {
  const { weight, climate } = (req.validatedQuery ?? {}) as {
    weight?: number;
    climate?: "normal" | "hot";
  };

  const overrides: { weight?: number; climate?: "normal" | "hot" } = {};
  if (weight !== undefined) overrides.weight = weight;
  if (climate !== undefined) overrides.climate = climate;

  const result = await waterService.calculateWaterNeed(
    req.user!.userId,
    overrides,
  );

  sendSuccess(res, 200, "Besoins hydriques calculés", { result });
});
