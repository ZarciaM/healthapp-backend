import type { Types } from "mongoose";

export interface ISleepEntry {
  userId: Types.ObjectId;
  bedTime: Date;
  wakeTime: Date;
  durationMinutes: number;
  quality: 1 | 2 | 3 | 4 | 5;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
