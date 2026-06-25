import HealthProfile from "../modules/healthProfile/healthProfile.model.js";
import * as bmiService from "../modules/bmi/bmi.service.js";
import type { IHealthProfile } from "../modules/healthProfile/healthProfile.types.js";
import type { IBmiEntry } from "../modules/bmi/bmi.types.js";
import { ApiError } from "./ApiError.js";

export type WeightSource = "override" | "latest_entry" | "health_profile";

export type ResolvedWeight = {
  weight: number;
  weightSource: WeightSource;
  healthProfile: IHealthProfile;
  latestEntry: IBmiEntry | null;
};

export async function resolveUserWeight(
  userId: string,
  overrideWeight?: number,
): Promise<ResolvedWeight> {
  const healthProfile = await HealthProfile.findOne({ userId }).lean();

  if (!healthProfile) {
    throw ApiError.badRequest(
      "Veuillez compléter votre profil de santé avant de calculer vos besoins",
    );
  }

  if (overrideWeight !== undefined) {
    return {
      weight: overrideWeight,
      weightSource: "override",
      healthProfile,
      latestEntry: null,
    };
  }

  const latestEntry = await bmiService.getLatest(userId);
  if (latestEntry) {
    return {
      weight: latestEntry.weight,
      weightSource: "latest_entry",
      healthProfile,
      latestEntry,
    };
  }

  if (healthProfile.currentWeight !== undefined) {
    return {
      weight: healthProfile.currentWeight,
      weightSource: "health_profile",
      healthProfile,
      latestEntry: null,
    };
  }

  throw ApiError.badRequest(
    "Veuillez compléter votre profil de santé ou enregistrer une pesée avant de calculer vos besoins",
  );
}
