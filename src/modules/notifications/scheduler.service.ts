import cron, { type ScheduledTask } from "node-cron";
import logger from "../../utils/logger.js";
import { findDueReminders } from "../medication/medication.service.js";
import { sendEmail } from "./email.service.js";
import { sendPushNotification } from "./push.service.js";
import { medicationReminderEmailTemplate } from "./templates/medicationReminder.template.js";
import PushSubscription from "./pushSubscription.model.js";

export function startScheduler(): ScheduledTask {
  logger.info("Starting medication reminder scheduler");

  const task = cron.schedule("* * * * *", async () => {
    try {
      const dueReminders = await findDueReminders();

      if (dueReminders.length === 0) return;

      logger.info(`Found ${dueReminders.length} due medication reminder(s)`);

      for (const { reminder, user } of dueReminders) {
        const templateHtml = medicationReminderEmailTemplate({
          firstName: user.firstName,
          medicationName: reminder.medicationName,
          dosage: reminder.dosage,
        });

        if (reminder.notifyByEmail) {
          const emailResult = await sendEmail({
            to: user.email,
            subject: `Medication Reminder: ${reminder.medicationName}`,
            html: templateHtml,
          });

          if (!emailResult.success) {
            logger.error(
              `Failed to send email reminder for user ${reminder.userId} | medication: ${reminder.medicationName}`,
            );
          }
        }

        if (reminder.notifyByPush) {
          const subscriptions = await PushSubscription.find({
            userId: reminder.userId,
          }).lean();

          for (const sub of subscriptions) {
            const pushResult = await sendPushNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
              },
              {
                title: "Medication Reminder",
                body: `Time to take ${reminder.medicationName}${reminder.dosage ? ` (${reminder.dosage})` : ""}`,
              },
            );

            if (pushResult.isExpiredSubscription) {
              await PushSubscription.deleteOne({ _id: sub._id });
              logger.warn(`Removed expired push subscription for user ${reminder.userId}`);
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`Scheduler error: ${message}`);
    }
  }, { noOverlap: true });

  return task;
}
