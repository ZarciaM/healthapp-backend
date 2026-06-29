import { Types } from "mongoose";
import type { Model } from "mongoose";
import { formatInTimeZone } from "date-fns-tz";
import User from "../modules/user/user.model.js";

export interface DueReminderResult<T> {
  reminder: T;
  user: { email: string; firstName: string };
}

export async function findDueRemindersByTimezone<T extends { userId: Types.ObjectId; isActive: boolean; times: string[] }>(
  model: Model<T>,
  extraConditions: Record<string, unknown> = {},
  now: Date = new Date(),
): Promise<DueReminderResult<T>[]> {
  const activeFilter = { isActive: true, ...extraConditions } as Record<string, unknown>;
  const activeUserIds = await model.distinct("userId", activeFilter);
  if (activeUserIds.length === 0) return [];

  const distinctTimezones = await User.distinct("timezone", {
    _id: { $in: activeUserIds },
  });

  const results: DueReminderResult<T>[] = [];

  for (const tz of distinctTimezones) {
    const effectiveTz: string = tz ?? "UTC";
    const localHHMM = formatInTimeZone(now, effectiveTz, "HH:mm");

    const tzUserFilter = tz === null
      ? { $or: [{ timezone: null }, { timezone: { $exists: false } }] }
      : { timezone: tz };

    const tzUserIds = await User.find(tzUserFilter).distinct("_id") as Types.ObjectId[];
    if (tzUserIds.length === 0) continue;

    const reminders = await model.find({
      userId: { $in: tzUserIds },
      isActive: true,
      times: localHHMM,
      ...extraConditions,
    } as Record<string, unknown>).lean();

    if (reminders.length === 0) continue;

    const reminderUserIds = [...new Set(reminders.map((r) => r.userId.toString()))];
    const users = await User.find({
      _id: { $in: reminderUserIds.map((id) => new Types.ObjectId(id)) },
    }).select("email firstName").lean();

    const userMap = new Map(
      users.map((u) => [u._id.toString(), { email: u.email, firstName: u.firstName }]),
    );

    for (const reminder of reminders) {
      const user = userMap.get(reminder.userId.toString());
      if (user) {
        results.push({ reminder: reminder as unknown as T, user });
      }
    }
  }

  return results;
}
