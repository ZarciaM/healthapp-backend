import { Types } from "mongoose";
import cron, { type ScheduledTask } from "node-cron";
import logger from "../../utils/logger.js";
import { findDueReminders as findDueMedicationReminders } from "../medication/medication.service.js";
import { findDueReminders as findDueHydrationReminders } from "../hydration/hydration.service.js";
import { sendEmail } from "./email.service.js";
import { sendPushNotification } from "./push.service.js";
import { medicationReminderEmailTemplate } from "./templates/medicationReminder.template.js";
import { hydrationReminderEmailTemplate } from "./templates/hydrationReminder.template.js";
import PushSubscription from "./pushSubscription.model.js";

function formatUTCHHMM(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

async function sendNotifications(
  userId: Types.ObjectId,
  notifyByEmail: boolean,
  notifyByPush: boolean,
  user: { email: string; firstName: string },
  emailSubject: string,
  emailHtml: string,
  pushTitle: string,
  pushBody: string,
): Promise<void> {
  if (notifyByEmail) {
    const emailResult = await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
    });

    if (!emailResult.success) {
      logger.error(
        `Failed to send email reminder for user ${userId}`,
      );
    }
  }

  if (notifyByPush) {
    const subscriptions = await PushSubscription.find({
      userId,
    }).lean();

    for (const sub of subscriptions) {
      const pushResult = await sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        },
        {
          title: pushTitle,
          body: pushBody,
        },
      );

      if (pushResult.isExpiredSubscription) {
        await PushSubscription.deleteOne({ _id: sub._id });
        logger.warn(`Removed expired push subscription for user ${userId}`);
      }
    }
  }
}

async function processMinute(tickDate: Date): Promise<void> {
  // --- Medication reminders ---
  try {
    const medicationReminders = await findDueMedicationReminders(tickDate);

    if (medicationReminders.length > 0) {
      logger.info(`Found ${medicationReminders.length} due medication reminder(s) at ${tickDate.toISOString()}`);

      for (const { reminder, user } of medicationReminders) {
        try {
          const templateHtml = medicationReminderEmailTemplate({
            firstName: user.firstName,
            medicationName: reminder.medicationName,
            dosage: reminder.dosage,
          });

          await sendNotifications(
            reminder.userId,
            reminder.notifyByEmail,
            reminder.notifyByPush,
            user,
            `Medication Reminder: ${reminder.medicationName}`,
            templateHtml,
            "Medication Reminder",
            `Time to take ${reminder.medicationName}${reminder.dosage ? ` (${reminder.dosage})` : ""}`,
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger.error(`Error processing medication reminder for user ${reminder.userId}: ${message}`);
        }
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Scheduler error (medication): ${message}`);
  }

  // --- Hydration reminders ---
  try {
    const currentTime = formatUTCHHMM(tickDate);
    const hydrationReminders = await findDueHydrationReminders(currentTime, tickDate);

    if (hydrationReminders.length > 0) {
      logger.info(`Found ${hydrationReminders.length} due hydration reminder(s) at ${tickDate.toISOString()}`);

      for (const { reminder, user } of hydrationReminders) {
        try {
          const templateHtml = hydrationReminderEmailTemplate({
            firstName: user.firstName,
          });

          await sendNotifications(
            reminder.userId,
            reminder.notifyByEmail,
            reminder.notifyByPush,
            user,
            "Hydration Reminder",
            templateHtml,
            "Hydration Reminder",
            "Time to drink some water! Stay hydrated 💧",
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger.error(`Error processing hydration reminder for user ${reminder.userId}: ${message}`);
        }
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Scheduler error (hydration): ${message}`);
  }
}

let lastProcessedMinute: number | null = null;

function getUTCMinuteEpoch(date: Date): number {
  return Math.floor(date.getTime() / 60000);
}

export function startScheduler(): ScheduledTask {
  logger.info("Starting health reminder scheduler");

  const task = cron.schedule("* * * * *", async () => {
    const now = new Date();
    const currentMinute = getUTCMinuteEpoch(now);
    const startMinute = lastProcessedMinute !== null ? lastProcessedMinute + 1 : currentMinute;
    const MAX_BACKFILL = 60;
    const endMinute = Math.min(currentMinute, startMinute + MAX_BACKFILL - 1);

    for (let m = startMinute; m <= endMinute; m++) {
      const tickDate = new Date(m * 60000);
      await processMinute(tickDate);
    }

    lastProcessedMinute = currentMinute;
  }, { noOverlap: true });

  return task;
}
