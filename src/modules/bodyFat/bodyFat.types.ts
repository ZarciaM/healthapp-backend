import type { Types } from "mongoose";

export interface IBodyFatEntry {
  userId: Types.ObjectId;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
  heightCm: number;
  bodyFatPercent: number;
  category: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
