import { Types } from "mongoose";
import PregnancyProfile from "./pregnancy.model.js";
import type { IPregnancyProfile, CalculationMethod, PregnancyOutcome } from "./pregnancy.types.js";
import {
  calculateDueDateFromLMP,
  calculateDueDateFromConception,
  calculateGestationalAge,
  type GestationalAgeResult,
} from "../../utils/healthFormulas.js";
import { pregnancyMilestones, type MilestoneEntry } from "./pregnancyMilestones.data.js";
import { ApiError } from "../../utils/ApiError.js";

export async function createProfile(
  userId: string,
  data: {
    calculationMethod: CalculationMethod;
    lastMenstrualPeriod?: Date;
    conceptionDate?: Date;
  },
): Promise<IPregnancyProfile> {
  const existingActive = await PregnancyProfile.findOne({
    userId: new Types.ObjectId(userId),
    isActive: true,
  }).lean();

  if (existingActive) {
    throw ApiError.conflict(
      "Une grossesse est déjà en cours de suivi, terminez-la avant d'en démarrer une nouvelle",
    );
  }

  let dueDate: Date;
  if (data.calculationMethod === "lmp") {
    dueDate = calculateDueDateFromLMP(data.lastMenstrualPeriod!);
  } else {
    dueDate = calculateDueDateFromConception(data.conceptionDate!);
  }

  try {
    const profile = await PregnancyProfile.create({
      userId: new Types.ObjectId(userId),
      calculationMethod: data.calculationMethod,
      lastMenstrualPeriod: data.lastMenstrualPeriod,
      conceptionDate: data.conceptionDate,
      dueDate,
      isActive: true,
    });

    return profile.toObject();
  } catch (err: unknown) {
    if ((err as Record<string, unknown>)?.code === 11000) {
      throw ApiError.conflict(
      "Une grossesse est déjà en cours de suivi, terminez-la avant d'en démarrer une nouvelle",
    );
    }
    throw err;
  }
}

export async function getCurrentPregnancy(userId: string): Promise<IPregnancyProfile | null> {
  const profile = await PregnancyProfile.findOne({
    userId: new Types.ObjectId(userId),
    isActive: true,
  }).lean();

  return profile;
}

export type GetProgressResult =
  | {
      pregnancy: IPregnancyProfile;
      gestationalAge: GestationalAgeResult;
      daysUntilDueDate: number;
      currentMilestone: MilestoneEntry | null;
    }
  | { error: string };

export async function getProgress(userId: string): Promise<GetProgressResult> {
  const pregnancy = await PregnancyProfile.findOne({
    userId: new Types.ObjectId(userId),
    isActive: true,
  }).lean();

  if (!pregnancy) {
    return { error: "Aucune grossesse active trouvée" };
  }

  const gestationalAge = calculateGestationalAge(pregnancy.dueDate);
  const daysUntilDueDate =
    Math.round(
      (pregnancy.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

  let currentMilestone: MilestoneEntry | null = null;
  if (gestationalAge.anomaly !== "pre_conception") {
    currentMilestone =
      pregnancyMilestones.find(
        (m) => m.weekNumber === Math.min(gestationalAge.weeks, 40),
      ) ?? null;
  }

  return {
    pregnancy,
    gestationalAge,
    daysUntilDueDate,
    currentMilestone,
  };
}

export async function closePregnancy(
  userId: string,
  profileId: string,
  outcome?: PregnancyOutcome,
): Promise<IPregnancyProfile> {
  const profile = await PregnancyProfile.findById(profileId);

  if (!profile) {
    throw ApiError.notFound("Pregnancy profile not found");
  }

  if (profile.userId.toString() !== userId) {
    throw ApiError.forbidden("You can only close your own pregnancy profile");
  }

  profile.isActive = false;
  if (outcome) {
    profile.outcome = outcome;
  }
  await profile.save();

  return profile.toObject();
}

export async function getHistory(userId: string): Promise<IPregnancyProfile[]> {
  const profiles = await PregnancyProfile.find({
    userId: new Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .lean();

  return profiles;
}
