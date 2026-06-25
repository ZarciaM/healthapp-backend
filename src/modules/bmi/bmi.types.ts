import type { Types } from "mongoose";

export interface IBmiEntry {
  userId: Types.ObjectId;
  weight: number;
  height: number;
  bmiValue: number;
  category: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
