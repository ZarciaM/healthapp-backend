import { Types } from "mongoose";
import BmiEntry from "./bmi.model.js";
import type { IBmiEntry } from "./bmi.types.js";
import { calculateBMI, getBMICategory } from "../../utils/healthFormulas.js";
import { ApiError } from "../../utils/ApiError.js";

type CreateEntryData = {
  weight: number;
  height: number;
  recordedAt?: Date;
};

export async function createEntry(
  userId: string,
  data: CreateEntryData,
): Promise<IBmiEntry & { message: string }> {
  const bmiValue = calculateBMI(data.weight, data.height);
  const { category, message } = getBMICategory(bmiValue);

  const entry = await BmiEntry.create({
    userId: new Types.ObjectId(userId),
    weight: data.weight,
    height: data.height,
    bmiValue,
    category,
    recordedAt: data.recordedAt ?? new Date(),
  });

  return { ...entry.toObject(), message };
}

export async function getHistory(
  userId: string,
  options?: { limit?: number; from?: Date; to?: Date },
): Promise<IBmiEntry[]> {
  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };

  if (options?.from || options?.to) {
    const dateFilter: Record<string, Date> = {};
    if (options.from) dateFilter.$gte = options.from;
    if (options.to) dateFilter.$lte = options.to;
    filter.recordedAt = dateFilter;
  }

  const limit = Math.min(options?.limit ?? 50, 200);

  return BmiEntry.find(filter)
    .sort({ recordedAt: -1 })
    .limit(limit)
    .lean();
}

export async function getLatest(
  userId: string,
): Promise<IBmiEntry | null> {
  return BmiEntry.findOne({ userId: new Types.ObjectId(userId) })
    .sort({ recordedAt: -1 })
    .lean();
}

export async function deleteEntry(
  userId: string,
  entryId: string,
): Promise<void> {
  const entry = await BmiEntry.findById(entryId);

  if (!entry) {
    throw ApiError.notFound("Entrée IMC introuvable");
  }

  if (entry.userId.toString() !== userId) {
    throw ApiError.forbidden("Vous ne pouvez pas supprimer une entrée qui ne vous appartient pas");
  }

  await BmiEntry.findByIdAndDelete(entryId);
}
