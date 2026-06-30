import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import * as dashboardService from "./dashboard.service.js";

export const getDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const dashboard = await dashboardService.getDashboard(req.user!.userId);

    sendSuccess(res, 200, "Dashboard récupéré", { dashboard });
  },
);
