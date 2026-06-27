import type { Types } from "mongoose";

export type CalculationMethod = "lmp" | "conception";

export interface IPregnancyProfile {
  userId: Types.ObjectId;
  calculationMethod: CalculationMethod;
  lastMenstrualPeriod?: Date;
  conceptionDate?: Date;
  dueDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
