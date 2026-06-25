import { Types } from "mongoose";
import SleepEntry from "./sleep.model.js";
import type { ISleepEntry } from "./sleep.types.js";
import {
  calculateSleepDuration,
  getSleepDurationFeedback,
} from "../../utils/healthFormulas.js";
import { ApiError } from "../../utils/ApiError.js";
import type { SleepQuality } from "./sleep.types.js";

type CreateEntryData = {
  bedTime: Date;
  wakeTime: Date;
  quality: SleepQuality;
};

export async function createEntry(
  userId: string,
  data: CreateEntryData,
): Promise<ISleepEntry & { feedback: ReturnType<typeof getSleepDurationFeedback> }> {
  const durationMinutes = calculateSleepDuration(data.bedTime, data.wakeTime);
  const feedback = getSleepDurationFeedback(durationMinutes);

  const entry = await SleepEntry.create({
    userId: new Types.ObjectId(userId),
    bedTime: data.bedTime,
    wakeTime: data.wakeTime,
    durationMinutes,
    quality: data.quality,
    recordedAt: new Date(),
  });

  return { ...entry.toObject(), feedback };
}

export async function getHistory(
  userId: string,
  options?: { limit?: number; from?: Date; to?: Date },
): Promise<ISleepEntry[]> {
  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };

  if (options?.from || options?.to) {
    const dateFilter: Record<string, Date> = {};
    if (options.from) dateFilter.$gte = options.from;
    if (options.to) dateFilter.$lte = options.to;
    filter.bedTime = dateFilter;
  }

  const limit = Math.max(1, Math.min(options?.limit ?? 50, 200));

  return SleepEntry.find(filter)
    .sort({ bedTime: -1 })
    .limit(limit)
    .lean();
}

export async function getLatest(userId: string): Promise<ISleepEntry | null> {
  return SleepEntry.findOne({ userId: new Types.ObjectId(userId) })
    .sort({ bedTime: -1 })
    .lean();
}

export async function getAverages(
  userId: string,
  days: number = 7,
): Promise<{
  averageDurationMinutes: number;
  averageQuality: number;
  entriesCount: number;
  message: string;
}> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await SleepEntry.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        bedTime: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        averageDurationMinutes: { $avg: "$durationMinutes" },
        averageQuality: { $avg: "$quality" },
        entriesCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0 || result[0].entriesCount === 0) {
    return {
      averageDurationMinutes: 0,
      averageQuality: 0,
      entriesCount: 0,
      message: "Aucune donnée de sommeil enregistrée sur cette période",
    };
  }

  const { averageDurationMinutes, averageQuality, entriesCount } = result[0];

  return {
    averageDurationMinutes: Math.round(averageDurationMinutes),
    averageQuality: Math.round(averageQuality * 10) / 10,
    entriesCount,
    message: `Moyennes calculées sur ${entriesCount} nuits (${days} derniers jours)`,
  };
}

export async function deleteEntry(
  userId: string,
  entryId: string,
): Promise<void> {
  const entry = await SleepEntry.findById(entryId);

  if (!entry) {
    throw ApiError.notFound("Entrée de sommeil introuvable");
  }

  if (entry.userId.toString() !== userId) {
    throw ApiError.forbidden("Vous ne pouvez pas supprimer une entrée qui ne vous appartient pas");
  }

  await SleepEntry.findByIdAndDelete(entryId);
}
