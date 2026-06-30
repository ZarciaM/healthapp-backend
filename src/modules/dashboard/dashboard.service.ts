import User from "../user/user.model.js";
import * as bmiService from "../bmi/bmi.service.js";
import * as weightService from "../weight/weight.service.js";
import * as caloriesService from "../calories/calories.service.js";
import * as waterService from "../water/water.service.js";
import * as sleepService from "../sleep/sleep.service.js";
import * as bloodPressureService from "../bloodPressure/bloodPressure.service.js";
import * as heartRateService from "../heartRate/heartRate.service.js";
import * as bodyFatService from "../bodyFat/bodyFat.service.js";
import * as medicationService from "../medication/medication.service.js";
import * as hydrationService from "../hydration/hydration.service.js";
import * as menstrualCycleService from "../menstrualCycle/menstrualCycle.service.js";
import * as pregnancyService from "../pregnancy/pregnancy.service.js";
import * as healthProfileService from "../healthProfile/healthProfile.service.js";
import { formatInTimeZone } from "date-fns-tz";
import type {
  DashboardResponse,
  WomenSpecificSection,
} from "./dashboard.types.js";
import type { IMedicationReminder } from "../medication/medication.types.js";

async function safeCall<T>(
  promise: Promise<T>,
  fallbackKey: string,
): Promise<T | { error: string }> {
  try {
    return await promise;
  } catch (err) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: `Erreur dans ${fallbackKey}` };
  }
}

function unwrapSettled<T>(
  result: PromiseSettledResult<T>,
  fallbackKey: string,
): T | { error: string } {
  if (result.status === "fulfilled") {
    return result.value;
  }
  const err = result.reason;
  if (err instanceof Error) {
    return { error: err.message };
  }
  return { error: `Erreur dans ${fallbackKey}` };
}

function isError<T>(
  result: T | { error: string } | null | undefined,
): result is { error: string } {
  if (result === null || result === undefined) return false;
  return typeof (result as { error: string }).error === "string";
}

function calculateAge(dateOfBirth: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = now.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

function getUpcomingToday(
  reminders: IMedicationReminder[],
  timezone: string,
): IMedicationReminder[] {
  const now = new Date();

  return reminders.filter((reminder) => {
    if (reminder.startDate > now) return false;
    if (reminder.endDate && reminder.endDate <= now) return false;

    const currentLocalTime = formatInTimeZone(now, timezone, "HH:mm");

    return reminder.times.some((time) => time > currentLocalTime);
  });
}

export async function getDashboard(userId: string): Promise<DashboardResponse> {
  const user = await User.findById(userId)
    .select("firstName gender dateOfBirth timezone")
    .lean();

  if (!user) {
    throw new Error("Utilisateur introuvable");
  }

  const age = user.dateOfBirth ? calculateAge(user.dateOfBirth) : 0;
  const gender = user.gender ?? "";
  const timezone = user.timezone ?? "UTC";

  const settled = await Promise.allSettled([
    safeCall(healthProfileService.getProfile(userId), "health_profile"),
    safeCall(bmiService.getLatest(userId), "bmi"),
    safeCall(weightService.getCurrentWeight(userId), "weight_current"),
    safeCall(weightService.getProgress(userId), "weight_progress"),
    safeCall(caloriesService.calculateDailyCalories(userId), "calories"),
    safeCall(waterService.calculateWaterNeed(userId), "water"),
    safeCall(sleepService.getLatest(userId), "sleep_latest"),
    safeCall(sleepService.getAverages(userId, 7), "sleep_averages"),
    safeCall(bloodPressureService.getLatest(userId), "bp_latest"),
    safeCall(bloodPressureService.getAverages(userId, 7), "bp_averages"),
    safeCall(heartRateService.getLatest(userId), "heart_rate"),
    safeCall(bodyFatService.getLatest(userId), "body_fat"),
    safeCall(medicationService.getReminders(userId, { activeOnly: true }), "medications"),
    safeCall(hydrationService.getReminder(userId), "hydration"),
  ]);

  const [
    profile,
    bmiLatest,
    weightCurrent,
    weightProgress,
    calories,
    water,
    sleepLatest,
    sleepAverages,
    bpLatest,
    bpAverages,
    hrLatest,
    bodyFatLatest,
    medications,
    hydration,
  ] = [
    unwrapSettled(settled[0], "health_profile"),
    unwrapSettled(settled[1], "bmi"),
    unwrapSettled(settled[2], "weight_current"),
    unwrapSettled(settled[3], "weight_progress"),
    unwrapSettled(settled[4], "calories"),
    unwrapSettled(settled[5], "water"),
    unwrapSettled(settled[6], "sleep_latest"),
    unwrapSettled(settled[7], "sleep_averages"),
    unwrapSettled(settled[8], "bp_latest"),
    unwrapSettled(settled[9], "bp_averages"),
    unwrapSettled(settled[10], "heart_rate"),
    unwrapSettled(settled[11], "body_fat"),
    unwrapSettled(settled[12], "medications"),
    unwrapSettled(settled[13], "hydration"),
  ];

  let womenSpecific: WomenSpecificSection | null = null;

  if (gender === "female") {
    const womenSettled = await Promise.allSettled([
      safeCall(menstrualCycleService.getCycleStats(userId), "cycle_stats"),
      safeCall(menstrualCycleService.predictNextPeriod(userId), "cycle_prediction"),
      safeCall(pregnancyService.getCurrentPregnancy(userId), "pregnancy_current"),
      safeCall(pregnancyService.getProgress(userId), "pregnancy_progress"),
    ]);

    const [cycleStats, cyclePrediction, pregnancyCurrent, pregnancyProgress] = [
      unwrapSettled(womenSettled[0], "cycle_stats"),
      unwrapSettled(womenSettled[1], "cycle_prediction"),
      unwrapSettled(womenSettled[2], "pregnancy_current"),
      unwrapSettled(womenSettled[3], "pregnancy_progress"),
    ];

    womenSpecific = {
      cycle:
        !isError(cycleStats) && !isError(cyclePrediction)
          ? { stats: cycleStats, nextPrediction: cyclePrediction }
          : null,
      pregnancy: {
        current: !isError(pregnancyCurrent) ? pregnancyCurrent : null,
        progress: !isError(pregnancyProgress) ? pregnancyProgress : null,
      },
    };
  }

  const allMedications = isError(medications) ? [] : medications;

  return {
    user: { firstName: user.firstName, gender, age },
    onboardingCompleted: !isError(profile) ? profile.isCompleted : false,
    bmi: {
      latest: !isError(bmiLatest) ? bmiLatest : null,
    },
    weight: {
      current: !isError(weightCurrent) ? weightCurrent : null,
      goal: !isError(weightProgress) ? weightProgress.goal : null,
      progress:
        !isError(weightProgress)
          ? {
              currentWeight: weightProgress.currentWeight,
              startingWeight: weightProgress.startingWeight,
              weightChange: weightProgress.weightChange,
              percentToGoal: weightProgress.percentToGoal,
            }
          : null,
    },
    calories: !isError(calories)
      ? { recommended: calories }
      : { error: calories.error },
    water: !isError(water)
      ? { recommended: water }
      : { error: water.error },
    sleep: {
      latest: !isError(sleepLatest) ? sleepLatest : null,
      weeklyAverage:
        !isError(sleepAverages)
          ? {
              averageDurationMinutes: sleepAverages.averageDurationMinutes,
              averageQuality: sleepAverages.averageQuality,
              entriesCount: sleepAverages.entriesCount,
            }
          : { averageDurationMinutes: 0, averageQuality: 0, entriesCount: 0 },
    },
    bloodPressure: {
      latest: !isError(bpLatest) ? bpLatest : null,
      weeklyAverage:
        !isError(bpAverages)
          ? bpAverages
          : {
              averageSystolic: 0,
              averageDiastolic: 0,
              averagePulse: 0,
              entriesCount: 0,
              overallCategory: {
                category: "aucune_donnee",
                severity: "",
                message: "Aucune donnée disponible",
              },
            },
    },
    heartRate: {
      latest: !isError(hrLatest) ? hrLatest : null,
    },
    bodyFat: {
      latest: !isError(bodyFatLatest) ? bodyFatLatest : null,
    },
    medications: {
      activeCount: allMedications.length,
      upcomingToday: getUpcomingToday(allMedications, timezone),
    },
    hydration: {
      isConfigured: !isError(hydration) && hydration !== null,
      isActive:
        !isError(hydration) && hydration !== null ? hydration.isActive : false,
    },
    womenSpecific,
  };
}
