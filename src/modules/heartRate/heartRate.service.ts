import { Types } from "mongoose";
import User from "../user/user.model.js";
import HeartRateEntry from "./heartRate.model.js";
import type { IHeartRateEntry } from "./heartRate.types.js";
import {
  getPulseCategory,
  calculateMaxHeartRate,
  calculateHeartRateZones,
} from "../../utils/healthFormulas.js";
import { ApiError } from "../../utils/ApiError.js";

function calculateAge(dateOfBirth: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = now.getMonth() - dateOfBirth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }
  return age;
}

export async function calculateZones(
  userId: string,
  overrideAge?: number,
): Promise<{
  maxHeartRate: number;
  zones: ReturnType<typeof calculateHeartRateZones>;
  age: number;
  ageSource: "override" | "profile";
}> {
  let age: number;
  let ageSource: "override" | "profile";

  if (overrideAge !== undefined) {
    age = overrideAge;
    ageSource = "override";
  } else {
    const user = await User.findById(userId).select("dateOfBirth").lean();

    if (!user?.dateOfBirth) {
      throw ApiError.badRequest(
        "Date de naissance manquante dans votre profil. Fournissez un âge ou renseignez votre date de naissance.",
      );
    }

    age = calculateAge(user.dateOfBirth);
    ageSource = "profile";
  }

  const maxHeartRate = calculateMaxHeartRate(age);
  const zones = calculateHeartRateZones(maxHeartRate);

  return { maxHeartRate, zones, age, ageSource };
}

type CreateEntryData = {
  bpm: number;
  context?: "resting" | "after_exercise" | "other";
  recordedAt?: Date;
};

export async function createEntry(
  userId: string,
  data: CreateEntryData,
): Promise<IHeartRateEntry & { message: string }> {
  const { category, message } = getPulseCategory(data.bpm);
  const context = data.context ?? "resting";

  let finalMessage = message;

  if (context === "after_exercise" && data.bpm > 100) {
    finalMessage =
      "Votre pouls est élevé après l'exercice, ce qui est normal. Il devrait revenir à la normale au repos.";
  } else if (context === "after_exercise") {
    finalMessage =
      "Votre pouls est mesuré après l'exercice. Comparez vos mesures à contexte similaire pour suivre votre progression.";
  }

  const entry = await HeartRateEntry.create({
    userId: new Types.ObjectId(userId),
    bpm: data.bpm,
    category,
    context,
    recordedAt: data.recordedAt ?? new Date(),
  });

  return { ...entry.toObject(), message: finalMessage };
}

export async function getHistory(
  userId: string,
  options?: { limit?: number; from?: Date; to?: Date },
): Promise<IHeartRateEntry[]> {
  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };

  if (options?.from || options?.to) {
    const dateFilter: Record<string, Date> = {};
    if (options.from) dateFilter.$gte = options.from;
    if (options.to) dateFilter.$lte = options.to;
    filter.recordedAt = dateFilter;
  }

  const limit = Math.max(1, Math.min(options?.limit ?? 50, 200));

  return HeartRateEntry.find(filter)
    .sort({ recordedAt: -1 })
    .limit(limit)
    .lean();
}

export async function getLatest(
  userId: string,
): Promise<IHeartRateEntry | null> {
  return HeartRateEntry.findOne({ userId: new Types.ObjectId(userId) })
    .sort({ recordedAt: -1 })
    .lean();
}

export async function getAverages(
  userId: string,
  days: number = 7,
  context?: string,
): Promise<{
  averageBpm: number;
  entriesCount: number;
  message: string;
}> {
  const normalizedDays =
    Number.isFinite(days) && days > 0 ? Math.min(days, 365) : 7;
  const since = new Date();
  since.setDate(since.getDate() - normalizedDays);

  const match: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
    recordedAt: { $gte: since },
  };

  if (context !== undefined) {
    match.context = context;
  }

  const result = await HeartRateEntry.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        averageBpm: { $avg: "$bpm" },
        entriesCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0 || result[0].entriesCount === 0) {
    return {
      averageBpm: 0,
      entriesCount: 0,
      message: "Aucune donnée de fréquence cardiaque enregistrée sur cette période",
    };
  }

  const { averageBpm, entriesCount } = result[0];

  return {
    averageBpm: Math.round(averageBpm * 10) / 10,
    entriesCount,
    message: `Moyenne calculée sur ${entriesCount} mesures (${normalizedDays} derniers jours)`,
  };
}

export async function deleteEntry(
  userId: string,
  entryId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(entryId)) {
    throw ApiError.badRequest("ID d'entrée de fréquence cardiaque invalide");
  }

  const entry = await HeartRateEntry.findById(entryId);

  if (!entry) {
    throw ApiError.notFound("Entrée de fréquence cardiaque introuvable");
  }

  if (entry.userId.toString() !== userId) {
    throw ApiError.forbidden(
      "Vous ne pouvez pas supprimer une entrée qui ne vous appartient pas",
    );
  }

  await HeartRateEntry.findByIdAndDelete(entryId);
}
