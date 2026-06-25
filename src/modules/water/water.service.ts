import { calculateDailyWaterNeed } from "../../utils/healthFormulas.js";
import { resolveUserWeight } from "../../utils/resolveUserWeight.js";
import { ApiError } from "../../utils/ApiError.js";

export async function calculateWaterNeed(
  userId: string,
  overrides?: { weight?: number; climate?: "normal" | "hot" },
): Promise<{
  totalMl: number;
  breakdown: { base: number; activityBonus: number; climateBonus: number };
  message: string;
  sourceData: {
    weight: number;
    weightSource: "override" | "latest_entry" | "health_profile";
    activityLevel: string;
    climate: "normal" | "hot";
  };
}> {
  const { weight, weightSource, healthProfile } = await resolveUserWeight(
    userId,
    overrides?.weight,
  );

  if (!healthProfile.activityLevel) {
    throw ApiError.badRequest(
      "Veuillez compléter le questionnaire santé (niveau d'activité) avant de calculer vos besoins hydriques",
    );
  }

  const climate = overrides?.climate ?? "normal";

  const { totalMl, breakdown, message } = calculateDailyWaterNeed({
    weightKg: weight,
    activityLevel: healthProfile.activityLevel,
    climate,
  });

  return {
    totalMl,
    breakdown,
    message,
    sourceData: {
      weight,
      weightSource,
      activityLevel: healthProfile.activityLevel,
      climate,
    },
  };
}
