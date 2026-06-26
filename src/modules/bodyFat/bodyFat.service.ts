import { Types } from "mongoose";
import User from "../user/user.model.js";
import BodyFatEntry from "./bodyFat.model.js";
import type { IBodyFatEntry } from "./bodyFat.types.js";
import {
  calculateBodyFatPercentage,
  getBodyFatCategory,
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

type CreateEntryData = {
  neckCm: number;
  waistCm: number;
  hipCm?: number;
  heightCm: number;
  recordedAt?: Date;
};

export async function createEntry(
  userId: string,
  data: CreateEntryData,
): Promise<IBodyFatEntry> {
  const user = await User.findById(userId)
    .select("gender dateOfBirth")
    .lean();

  if (!user) {
    throw ApiError.notFound("Utilisateur introuvable");
  }

  if (!user.dateOfBirth) {
    throw ApiError.badRequest(
      "Date de naissance manquante dans votre profil.",
    );
  }

  if (!user.gender) {
    throw ApiError.badRequest(
      "Genre manquant dans votre profil. Veuillez renseigner votre genre.",
    );
  }

  const gender = user.gender;

  if (gender === "female" && data.hipCm === undefined) {
    throw ApiError.badRequest(
      "La mesure des hanches est requise pour ce calcul.",
    );
  }

  if (data.waistCm <= data.neckCm) {
    throw ApiError.badRequest(
      "Le tour de taille doit être supérieur au tour de cou pour effectuer le calcul.",
    );
  }

  const age = calculateAge(user.dateOfBirth);

  const bodyFatPercent = calculateBodyFatPercentage({
    gender,
    heightCm: data.heightCm,
    neckCm: data.neckCm,
    waistCm: data.waistCm,
    ...(gender === "female" ? { hipCm: data.hipCm } : {}),
  });

  const { category } = getBodyFatCategory(bodyFatPercent, gender, age);

  const entry = await BodyFatEntry.create({
    userId: new Types.ObjectId(userId),
    neckCm: data.neckCm,
    waistCm: data.waistCm,
    ...(gender === "male" ? {} : { hipCm: data.hipCm }),
    heightCm: data.heightCm,
    bodyFatPercent,
    category,
    recordedAt: data.recordedAt ?? new Date(),
  });

  return entry.toObject();
}

export async function getHistory(
  userId: string,
  options?: { limit?: number; from?: Date; to?: Date },
): Promise<IBodyFatEntry[]> {
  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };

  if (options?.from || options?.to) {
    const dateFilter: Record<string, Date> = {};
    if (options.from) dateFilter.$gte = options.from;
    if (options.to) dateFilter.$lte = options.to;
    filter.recordedAt = dateFilter;
  }

  const rawLimit = options?.limit;
  const limit = Number.isFinite(rawLimit)
    ? Math.max(1, Math.min(rawLimit!, 200))
    : 50;

  return BodyFatEntry.find(filter)
    .sort({ recordedAt: -1, _id: -1 })
    .limit(limit)
    .lean();
}

export async function getLatest(
  userId: string,
): Promise<IBodyFatEntry | null> {
  return BodyFatEntry.findOne({ userId: new Types.ObjectId(userId) })
    .sort({ recordedAt: -1, _id: -1 })
    .lean();
}

export async function deleteEntry(
  userId: string,
  entryId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(entryId)) {
    throw ApiError.badRequest("ID d'entrée de graisse corporelle invalide");
  }

  const entry = await BodyFatEntry.findById(entryId);

  if (!entry) {
    throw ApiError.notFound("Entrée de graisse corporelle introuvable");
  }

  if (entry.userId.toString() !== userId) {
    throw ApiError.forbidden(
      "Vous ne pouvez pas supprimer une entrée qui ne vous appartient pas",
    );
  }

  await BodyFatEntry.findByIdAndDelete(entryId);
}
