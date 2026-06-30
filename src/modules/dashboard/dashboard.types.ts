import type { IBmiEntry } from "../bmi/bmi.types.js";
import type { IWeightGoal } from "../weight/weight.types.js";
import type { ISleepEntry } from "../sleep/sleep.types.js";
import type { IBloodPressureEntry } from "../bloodPressure/bloodPressure.types.js";
import type { IHeartRateEntry } from "../heartRate/heartRate.types.js";
import type { IBodyFatEntry } from "../bodyFat/bodyFat.types.js";
import type { IMedicationReminder } from "../medication/medication.types.js";
import type { IPregnancyProfile } from "../pregnancy/pregnancy.types.js";

export interface DashboardUser {
  firstName: string;
  gender: string;
  age: number;
}

export interface WeightProgress {
  currentWeight: number | null;
  startingWeight: number | null;
  weightChange: number | null;
  percentToGoal: number | null;
}

export interface DashboardWeight {
  current: IBmiEntry | null;
  goal: IWeightGoal | null;
  progress: WeightProgress | null;
}

export interface DailyCaloriesResult {
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
    weightSource: string;
  };
}

export interface WaterNeedResult {
  totalMl: number;
  breakdown: { base: number; activityBonus: number; climateBonus: number };
  message: string;
  sourceData: {
    weight: number;
    weightSource: string;
    activityLevel: string;
    climate: string;
  };
}

export interface SleepWeeklyAverage {
  averageDurationMinutes: number;
  averageQuality: number;
  entriesCount: number;
}

export interface BloodPressureWeeklyAverage {
  averageSystolic: number;
  averageDiastolic: number;
  averagePulse: number;
  entriesCount: number;
  overallCategory: {
    category: string;
    severity: string;
    message: string;
  };
}

export interface CycleSection {
  stats: {
    averageLength: number | null;
    isRegular: boolean;
    confidenceLevel: string;
    cyclesAnalyzed: number;
  };
  nextPrediction:
    | {
        estimatedDate: Date;
        rangeStart: Date;
        rangeEnd: Date;
        confidenceLevel: string;
        basedOnCyclesCount: number;
      }
    | { error: string };
}

export interface PregnancySection {
  current: IPregnancyProfile | null;
  progress: {
    pregnancy: IPregnancyProfile;
    gestationalAge: {
      weeks: number;
      days: number;
      trimester: 1 | 2 | 3;
      anomaly: "post_term" | "pre_conception" | null;
    };
    daysUntilDueDate: number;
    currentMilestone: {
      weekNumber: number;
      weekRange: string;
      title: string;
      description: string;
      trimester: 1 | 2 | 3;
    } | null;
  } | null;
}

export interface WomenSpecificSection {
  cycle: CycleSection | null;
  pregnancy: PregnancySection;
}

export type CaloriesSection =
  | { recommended: DailyCaloriesResult | null }
  | { error: string };

export type WaterSection =
  | { recommended: WaterNeedResult | null }
  | { error: string };

export interface DashboardResponse {
  user: DashboardUser;
  onboardingCompleted: boolean;
  bmi: { latest: IBmiEntry | null };
  weight: DashboardWeight;
  calories: CaloriesSection;
  water: WaterSection;
  sleep: {
    latest: ISleepEntry | null;
    weeklyAverage: SleepWeeklyAverage;
  };
  bloodPressure: {
    latest: IBloodPressureEntry | null;
    weeklyAverage: BloodPressureWeeklyAverage;
  };
  heartRate: { latest: IHeartRateEntry | null };
  bodyFat: { latest: IBodyFatEntry | null };
  medications: {
    activeCount: number;
    upcomingToday: IMedicationReminder[];
  };
  hydration: {
    isConfigured: boolean;
    isActive: boolean;
  };
  womenSpecific: WomenSpecificSection | null;
}
