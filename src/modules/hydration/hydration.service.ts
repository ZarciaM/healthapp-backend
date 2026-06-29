import { Types } from "mongoose";
import HydrationReminder from "./hydration.model.js";
import type { IHydrationReminder } from "./hydration.types.js";
import type { CreateHydrationReminderInput } from "./hydration.validation.js";
import { generateIntervalTimes } from "../../utils/healthFormulas.js";
import { findDueRemindersByTimezone } from "../../utils/timezoneScheduling.js";
import { ApiError } from "../../utils/ApiError.js";

export async function createOrUpdateReminder(
  userId: string,
  data: CreateHydrationReminderInput,
): Promise<IHydrationReminder> {
  let times: string[];

  if (data.mode === "fixed_times") {
    times = data.times!;
  } else {
    times = generateIntervalTimes(
      data.intervalConfig!.startTime,
      data.intervalConfig!.endTime,
      data.intervalConfig!.intervalHours,
    );
  }

  const update: Record<string, unknown> = {
    $set: {
      userId: new Types.ObjectId(userId),
      mode: data.mode,
      times,
      isActive: true,
      notifyByEmail: data.notifyByEmail ?? true,
      notifyByPush: data.notifyByPush ?? true,
    },
  };

  if (data.mode === "interval") {
    (update.$set as Record<string, unknown>).intervalConfig = data.intervalConfig;
  } else {
    update.$unset = { intervalConfig: "" };
  }

  const reminder = await HydrationReminder.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    update,
    { upsert: true, new: true, runValidators: true },
  );

  return reminder.toObject();
}

export async function getReminder(
  userId: string,
): Promise<IHydrationReminder | null> {
  return HydrationReminder.findOne({ userId: new Types.ObjectId(userId) }).lean();
}

export async function deactivate(userId: string): Promise<void> {
  const reminder = await HydrationReminder.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { isActive: false },
    { new: true },
  );

  if (!reminder) {
    throw ApiError.notFound("No hydration reminder found for this user");
  }
}

export async function reactivate(userId: string): Promise<IHydrationReminder> {
  const reminder = await HydrationReminder.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { isActive: true },
    { new: true, runValidators: true },
  );

  if (!reminder) {
    throw ApiError.notFound("No hydration reminder found for this user");
  }

  return reminder.toObject();
}

export async function deleteReminder(userId: string): Promise<void> {
  const reminder = await HydrationReminder.findOneAndDelete({
    userId: new Types.ObjectId(userId),
  });

  if (!reminder) {
    throw ApiError.notFound("No hydration reminder found for this user");
  }
}

export async function findDueReminders(
  currentTime: string,
  simulatedNow?: Date,
): Promise<Array<{ reminder: IHydrationReminder; user: { email: string; firstName: string } }>> {
  const [hours, minutes] = currentTime.split(":").map(Number);
  const now = simulatedNow ?? new Date();
  now.setUTCHours(hours, minutes, 0, 0);

  return findDueRemindersByTimezone(HydrationReminder, {}, now);
}
