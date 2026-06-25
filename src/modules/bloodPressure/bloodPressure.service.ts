import { Types } from "mongoose";
import BloodPressureEntry from "./bloodPressure.model.js";
import type { IBloodPressureEntry } from "./bloodPressure.types.js";
import { getBloodPressureCategory } from "../../utils/healthFormulas.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateBloodPressureEntryInput } from "./bloodPressure.validation.js";

export async function createEntry(
  userId: string,
  data: CreateBloodPressureEntryInput,
): Promise<IBloodPressureEntry & { message: string }> {
  const { category, severity, message } = getBloodPressureCategory(
    data.systolic,
    data.diastolic,
  );

  const entry = await BloodPressureEntry.create({
    userId: new Types.ObjectId(userId),
    systolic: data.systolic,
    diastolic: data.diastolic,
    pulse: data.pulse,
    category,
    severity,
    recordedAt: data.recordedAt ?? new Date(),
  });

  return { ...entry.toObject(), message };
}

export async function getHistory(
  userId: string,
  options?: { limit?: number; from?: Date; to?: Date },
): Promise<IBloodPressureEntry[]> {
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

  return BloodPressureEntry.find(filter)
    .sort({ recordedAt: -1 })
    .limit(limit)
    .lean();
}

export async function getLatest(
  userId: string,
): Promise<IBloodPressureEntry | null> {
  return BloodPressureEntry.findOne({ userId: new Types.ObjectId(userId) })
    .sort({ recordedAt: -1 })
    .lean();
}

export async function getAverages(
  userId: string,
  days: number = 7,
): Promise<{
  averageSystolic: number;
  averageDiastolic: number;
  averagePulse: number;
  entriesCount: number;
  overallCategory: {
    category: string;
    severity: string;
    message: string;
  };
}> {
  const normalizedDays =
    Number.isFinite(days) && days > 0 ? Math.min(days, 365) : 7;
  const since = new Date();
  since.setDate(since.getDate() - normalizedDays);

  const result = await BloodPressureEntry.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        recordedAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        averageSystolic: { $avg: "$systolic" },
        averageDiastolic: { $avg: "$diastolic" },
        averagePulse: { $avg: "$pulse" },
        entriesCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0 || result[0].entriesCount === 0) {
    return {
      averageSystolic: 0,
      averageDiastolic: 0,
      averagePulse: 0,
      entriesCount: 0,
      overallCategory: {
        category: "aucune_donnee",
        severity: "",
        message: "Aucune donnée de pression artérielle enregistrée sur cette période",
      },
    };
  }

  const { averageSystolic, averageDiastolic, averagePulse, entriesCount } =
    result[0];

  const overallCategory = getBloodPressureCategory(
    Math.round(averageSystolic),
    Math.round(averageDiastolic),
  );

  return {
    averageSystolic: Math.round(averageSystolic * 10) / 10,
    averageDiastolic: Math.round(averageDiastolic * 10) / 10,
    averagePulse: Math.round(averagePulse * 10) / 10,
    entriesCount,
    overallCategory,
  };
}

export async function deleteEntry(
  userId: string,
  entryId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(entryId)) {
    throw ApiError.badRequest("ID d'entrée de pression artérielle invalide");
  }

  const entry = await BloodPressureEntry.findById(entryId);

  if (!entry) {
    throw ApiError.notFound("Entrée de pression artérielle introuvable");
  }

  if (entry.userId.toString() !== userId) {
    throw ApiError.forbidden(
      "Vous ne pouvez pas supprimer une entrée qui ne vous appartient pas",
    );
  }

  await BloodPressureEntry.findByIdAndDelete(entryId);
}
