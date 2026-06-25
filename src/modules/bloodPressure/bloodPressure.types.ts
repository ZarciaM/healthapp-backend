import type { Types } from "mongoose";

export interface IBloodPressureEntry {
  userId: Types.ObjectId;
  systolic: number;
  diastolic: number;
  pulse: number;
  category: string;
  severity: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
