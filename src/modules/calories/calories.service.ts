import User from "../user/user.model.js";
import {
  calculateBMR,
  calculateTDEE,
  adjustCaloriesForGoal,
} from "../../utils/healthFormulas.js";
import { resolveUserWeight } from "../../utils/resolveUserWeight.js";
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

export async function calculateDailyCalories(
  userId: string,
  overrides?: { weight?: number; height?: number },
): Promise<{
  bmr: number;
  tdee: number;
  recommendedCalories: number;
  message: string;
  sourceData: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    goal: string;
    weightSource: "override" | "latest_entry" | "health_profile";
  };
}> {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw ApiError.notFound("Utilisateur introuvable");
  }

  if (!user.gender || !user.dateOfBirth) {
    throw ApiError.badRequest(
      "Veuillez compléter votre profil (genre et date de naissance) avant de calculer vos besoins caloriques",
    );
  }

  const hasPartialOverride =
    overrides !== undefined &&
    (overrides.weight !== undefined) !== (overrides.height !== undefined);

  if (hasPartialOverride) {
    throw ApiError.badRequest(
      "Les paramètres weight et height doivent être fournis ensemble pour surcharger les données du profil",
    );
  }

  const { weight, weightSource, healthProfile, latestEntry } =
    await resolveUserWeight(userId, overrides?.weight);

  if (!healthProfile.activityLevel || !healthProfile.goal) {
    throw ApiError.badRequest(
      "Veuillez compléter le questionnaire santé (niveau d'activité et objectif) avant de calculer vos besoins caloriques",
    );
  }

  let height: number;

  if (overrides?.height !== undefined) {
    height = overrides.height;
  } else if (latestEntry) {
    height = latestEntry.height;
  } else if (healthProfile.height !== undefined) {
    height = healthProfile.height;
  } else {
    throw ApiError.badRequest(
      "Veuillez compléter votre profil de santé (taille requise) avant de calculer vos besoins caloriques",
    );
  }

  const age = calculateAge(user.dateOfBirth);
  const gender = user.gender;
  const activityLevel = healthProfile.activityLevel;
  const goal = healthProfile.goal;

  const bmr = calculateBMR({ weightKg: weight, heightCm: height, age, gender });
  const tdee = calculateTDEE(bmr, activityLevel);
  const { calories: recommendedCalories, message } = adjustCaloriesForGoal(
    tdee,
    goal,
    gender,
  );

  return {
    bmr,
    tdee,
    recommendedCalories,
    message,
    sourceData: {
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      weightSource,
    },
  };
}
