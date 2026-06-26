import { Types } from "mongoose";
import { formatInTimeZone } from "date-fns-tz";
import MedicationReminder from "./medication.model.js";
import type { IMedicationReminder } from "./medication.types.js";
import { ApiError } from "../../utils/ApiError.js";
import User from "../user/user.model.js";

function parseDateFields(data: Record<string, unknown>): Record<string, unknown> {
  const parsed = { ...data };
  if (typeof parsed.startDate === "string") {
    parsed.startDate = new Date(parsed.startDate);
  }
  if (typeof parsed.endDate === "string") {
    parsed.endDate = new Date(parsed.endDate);
  }
  return parsed;
}

export async function createReminder(
  userId: string,
  data: Record<string, unknown>,
): Promise<IMedicationReminder> {
  const parsed = parseDateFields(data);

  const reminder = await MedicationReminder.create({
    userId: new Types.ObjectId(userId),
    ...parsed,
  });

  return reminder.toObject();
}

export async function getReminders(
  userId: string,
  options?: { activeOnly?: boolean },
): Promise<IMedicationReminder[]> {
  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };

  if (options?.activeOnly) {
    filter.isActive = true;
  }

  return MedicationReminder.find(filter)
    .sort({ createdAt: -1 })
    .lean();
}

export async function updateReminder(
  userId: string,
  reminderId: string,
  data: Record<string, unknown>,
): Promise<IMedicationReminder> {
  const reminder = await MedicationReminder.findById(reminderId);

  if (!reminder) {
    throw ApiError.notFound("Reminder not found");
  }

  if (reminder.userId.toString() !== userId) {
    throw ApiError.forbidden("You cannot update a reminder that does not belong to you");
  }

  const parsed = parseDateFields(data);

  const updated = await MedicationReminder.findByIdAndUpdate(
    reminderId,
    { $set: parsed },
    { new: true, runValidators: true },
  );

  if (!updated) {
    throw ApiError.notFound("Reminder not found");
  }

  return updated.toObject();
}

export async function deactivateReminder(
  userId: string,
  reminderId: string,
): Promise<void> {
  const reminder = await MedicationReminder.findById(reminderId);

  if (!reminder) {
    throw ApiError.notFound("Reminder not found");
  }

  if (reminder.userId.toString() !== userId) {
    throw ApiError.forbidden("You cannot deactivate a reminder that does not belong to you");
  }

  await MedicationReminder.findByIdAndUpdate(reminderId, { isActive: false });
}

export async function deleteReminder(
  userId: string,
  reminderId: string,
): Promise<void> {
  const reminder = await MedicationReminder.findById(reminderId);

  if (!reminder) {
    throw ApiError.notFound("Reminder not found");
  }

  if (reminder.userId.toString() !== userId) {
    throw ApiError.forbidden("You cannot delete a reminder that does not belong to you");
  }

  await MedicationReminder.findByIdAndDelete(reminderId);
}

export async function findDueReminders(
  simulatedNow?: Date,
): Promise<
  Array<{
    reminder: IMedicationReminder;
    user: { email: string; firstName: string };
  }>
> {
  const now = simulatedNow ?? new Date();

  /*
   * Le scheduler tourne toutes les minutes en UTC.
   * Un rappel programmé à "08:00" doit se déclencher à 8h DANS LE FUSEAU
   * de l'utilisateur, pas à 8h UTC.
   *
   * Pour éviter de charger tous les rappels actifs et les filtrer en JS
   * (coûteux), on groupe par fuseau horaire :
   *
   * 1. On récupère les userId des utilisateurs qui ont des rappels
   *    actifs dans la période valide.
   * 2. On déduit les fuseaux distincts parmi ces utilisateurs.
   * 3. Pour chaque fuseau, on convertit l'heure UTC actuelle vers
   *    l'heure locale du fuseau.
   * 4. On requête uniquement les rappels des utilisateurs DE CE FUSEAU
   *    dont l'heure locale correspond à un de leurs "times".
   *
   * Ainsi, le filtre MongoDB porte sur `times` ET `userId`, ce qui
   * limite les données chargées par fuseau.
   */

  // Étape 1 et 2 : trouver les fuseaux horaires distincts des
  // utilisateurs ayant des rappels actifs dans la période courante
  const activeReminderFilter = {
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: { $exists: false } },
      { endDate: null },
      { endDate: { $gte: now } },
    ],
  };

  const activeUserIds = await MedicationReminder.distinct("userId", activeReminderFilter);

  if (activeUserIds.length === 0) return [];

  const distinctTimezones = await User.distinct("timezone", {
    _id: { $in: activeUserIds },
  });

  const results: Array<{
    reminder: IMedicationReminder;
    user: { email: string; firstName: string };
  }> = [];

  for (const tz of distinctTimezones) {
    // null / undefined signifie que le champ n'existe pas en base
    // (comptes créés avant l'ajout du champ) → on traite comme UTC
    const effectiveTz: string = tz ?? "UTC";

    // Étape 3 : heure locale du fuseau à l'instant UTC courant
    const localHHMM = formatInTimeZone(now, effectiveTz, "HH:mm");

    // Étape 4a : utilisateurs de ce fuseau
    const tzUserFilter = tz === null
      ? { $or: [{ timezone: null }, { timezone: { $exists: false } }] }
      : { timezone: tz };

    const tzUserIds = (await User.find(tzUserFilter).distinct("_id") as Types.ObjectId[]);

    // Étape 4b : rappels dus maintenant pour ces utilisateurs
    const reminders = await MedicationReminder.find({
      userId: { $in: tzUserIds },
      isActive: true,
      times: localHHMM,
      startDate: { $lte: now },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } },
      ],
    }).lean();

    if (reminders.length === 0) continue;

    const reminderUserIds = [...new Set(reminders.map((r) => r.userId.toString()))];

    const users = await User.find({
      _id: { $in: reminderUserIds.map((id) => new Types.ObjectId(id)) },
    })
      .select("email firstName")
      .lean();

    const userMap = new Map(
      users.map((u) => [
        u._id.toString(),
        { email: u.email, firstName: u.firstName },
      ]),
    );

    for (const reminder of reminders) {
      const user = userMap.get(reminder.userId.toString());
      if (user) {
        results.push({ reminder, user });
      }
    }
  }

  return results;
}
