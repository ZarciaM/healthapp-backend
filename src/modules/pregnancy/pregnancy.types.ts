import type { Types } from "mongoose";

export type CalculationMethod = "lmp" | "conception";

export type PregnancyOutcome = "live_birth" | "stillbirth" | "miscarriage" | "abortion" | "other";

export interface IPregnancyProfile {
  userId: Types.ObjectId;
  calculationMethod: CalculationMethod;
  lastMenstrualPeriod?: Date;
  conceptionDate?: Date;
  dueDate: Date;
  isActive: boolean;
  outcome?: PregnancyOutcome;
  createdAt: Date;
  updatedAt: Date;
}
