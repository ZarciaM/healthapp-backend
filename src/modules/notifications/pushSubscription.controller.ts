import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { env } from "../../config/env.js";
import * as pushSubscriptionService from "./pushSubscription.service.js";

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw ApiError.badRequest("endpoint, keys.p256dh and keys.auth are required");
  }

  const subscription = await pushSubscriptionService.upsertSubscription(
    req.user!.userId,
    { endpoint, keys },
  );

  sendSuccess(res, 201, "Abonnement push enregistré", { subscription });
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { endpoint } = req.body;

  await pushSubscriptionService.removeSubscription(req.user!.userId, endpoint);

  sendSuccess(res, 200, "Abonnement push supprimé");
});

export const getVapidPublicKey = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, 200, "Clé publique VAPID", { publicKey: env.VAPID_PUBLIC_KEY });
});
