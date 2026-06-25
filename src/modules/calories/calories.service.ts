import User from "../user/user.model.js";
import HealthProfile from "../healthProfile/healthProfile.model.js";
import * as bmiService from "../bmi/bmi.service.js";
import {
  calculateBMR,
  calculateTDEE,
  adjustCaloriesForGoal,
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

  const healthProfile = await HealthProfile.findOne({ userId }).lean();
  if (!healthProfile) {
    throw ApiError.badRequest(
      "Veuillez compléter votre profil de santé avant de calculer vos besoins caloriques",
    );
  }

  if (!healthProfile.activityLevel || !healthProfile.goal) {
    throw ApiError.badRequest(
      "Veuillez compléter le questionnaire santé (niveau d'activité et objectif) avant de calculer vos besoins caloriques",
    );
  }

  let weight: number;
  let height: number;
  let weightSource: "override" | "latest_entry" | "health_profile";

  if (overrides?.weight !== undefined && overrides?.height !== undefined) {
    weight = overrides.weight;
    height = overrides.height;
    weightSource = "override";
  } else {
    const latestEntry = await bmiService.getLatest(userId);
    if (latestEntry) {
      weight = latestEntry.weight;
      height = latestEntry.height;
      weightSource = "latest_entry";
    } else if (
      healthProfile.currentWeight !== undefined &&
      healthProfile.height !== undefined
    ) {
      weight = healthProfile.currentWeight;
      height = healthProfile.height;
      weightSource = "health_profile";
    } else {
      throw ApiError.badRequest(
        "Veuillez compléter votre profil de santé ou enregistrer une pesée avant de calculer vos besoins caloriques",
      );
    }
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
