import HealthProfile from "./healthProfile.model.js";
import { ApiError } from "../../utils/ApiError.js";
import type { IHealthProfile } from "./healthProfile.types.js";

function getStepFields(
  step: number,
  data: Record<string, unknown>,
): Record<string, unknown> {
  switch (step) {
    case 1:
      return { height: data.height, currentWeight: data.currentWeight };
    case 2:
      return { activityLevel: data.activityLevel, goal: data.goal };
    case 3:
      return { medicalHistory: data.medicalHistory };
    case 4:
      return { lifestyle: data.lifestyle };
    case 5:
      return { womenSpecific: data.womenSpecific };
    default:
      throw ApiError.badRequest(`Étape invalide : ${step}`);
  }
}

function isProfileComplete(profile: IHealthProfile): boolean {
  return !!(
    profile.height &&
    profile.currentWeight &&
    profile.activityLevel &&
    profile.goal
  );
}

export async function getOrCreateProfile(
  userId: string,
): Promise<IHealthProfile> {
  const existing = await HealthProfile.findOne({ userId });

  if (existing) {
    return existing;
  }

  return HealthProfile.create({
    userId,
    onboardingStep: 0,
    isCompleted: false,
  });
}

export async function submitStep(
  userId: string,
  step: number,
  data: Record<string, unknown>,
  userGender: "male" | "female",
): Promise<IHealthProfile> {
  if (step === 5 && userGender === "male") {
    throw ApiError.badRequest("Cette étape ne concerne pas votre profil");
  }

  const profile = await HealthProfile.findOne({ userId });

  if (!profile) {
    throw ApiError.notFound("Profil santé introuvable");
  }

  if (step > profile.onboardingStep + 1) {
    throw ApiError.badRequest(
      "Vous ne pouvez pas sauter d'étape. Veuillez compléter les étapes dans l'ordre.",
    );
  }

  const stepFields = getStepFields(step, data);

  const update: Record<string, unknown> = { $set: stepFields };

  if (step > profile.onboardingStep) {
    (update.$set as Record<string, unknown>).onboardingStep = step;
  }

  const updated = await HealthProfile.findOneAndUpdate(
    { userId },
    update,
    { new: true },
  );

  if (!updated) {
    throw ApiError.internal("Erreur lors de la mise à jour du profil");
  }

  const complete = isProfileComplete(updated);

  if (complete !== updated.isCompleted) {
    return HealthProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          isCompleted: complete,
          ...(complete ? { completedAt: new Date() } : { completedAt: null }),
        },
      },
      { new: true },
    ) as Promise<IHealthProfile>;
  }

  return updated;
}

export async function getProfile(userId: string): Promise<IHealthProfile> {
  const profile = await HealthProfile.findOne({ userId });

  if (!profile) {
    throw ApiError.notFound("Profil santé introuvable");
  }

  return profile;
}
