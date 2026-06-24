import type { Types } from "mongoose";

export interface IMedicalHistory {
  hypertension: boolean;
  diabetes: boolean;
  allergies: string[];
  currentMedications: string[];
}

export interface ILifestyle {
  averageSleepHours: number;
  smoker: boolean;
  alcoholConsumption: "none" | "occasional" | "regular";
}

export interface IWomenSpecific {
  cycleRegularity: "regular" | "irregular";
  lastPeriodDate: Date;
  averageCycleLength: number;
}

export interface IHealthProfile {
  userId: Types.ObjectId;
  height?: number;
  currentWeight?: number;
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal?: "lose_weight" | "gain_weight" | "maintain" | "general_health";
  medicalHistory: IMedicalHistory;
  lifestyle?: ILifestyle;
  womenSpecific?: IWomenSpecific;
  onboardingStep: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
