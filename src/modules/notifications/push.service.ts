import webPush from "web-push";
import { env } from "../../config/env.js";
import logger from "../../utils/logger.js";

webPush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

export async function sendPushNotification(
  subscription: webPush.PushSubscription,
  payload: { title: string; body: string },
): Promise<{ success: boolean; error?: string; isExpiredSubscription?: boolean }> {
  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));

    logger.info(`Push notification sent to ${subscription.endpoint}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (err instanceof webPush.WebPushError && err.statusCode === 410) {
      logger.warn(`Push subscription expired (410 Gone) — endpoint: ${subscription.endpoint}`);
      return { success: false, error: message, isExpiredSubscription: true };
    }

    logger.error(`Failed to send push notification to ${subscription.endpoint} | error: ${message}`);
    return { success: false, error: message };
  }
}
