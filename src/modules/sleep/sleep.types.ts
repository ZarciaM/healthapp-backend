import type { Types } from "mongoose";

export const SLEEP_QUALITY_VALUES = [1, 2, 3, 4, 5] as const;
export type SleepQuality = (typeof SLEEP_QUALITY_VALUES)[number];

export interface ISleepEntry {
  userId: Types.ObjectId;
  bedTime: Date;
  wakeTime: Date;
  durationMinutes: number;
  quality: SleepQuality;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
