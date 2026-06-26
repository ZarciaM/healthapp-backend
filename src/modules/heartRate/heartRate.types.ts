import type { Types } from "mongoose";

export interface IHeartRateEntry {
  userId: Types.ObjectId;
  bpm: number;
  category: string;
  context: "resting" | "after_exercise" | "other";
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
