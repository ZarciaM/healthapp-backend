import type { Types } from "mongoose";

export interface IHydrationReminder {
  userId: Types.ObjectId;
  mode: "fixed_times" | "interval";
  times: string[];
  intervalConfig?: {
    startTime: string;
    endTime: string;
    intervalHours: number;
  };
  isActive: boolean;
  notifyByEmail: boolean;
  notifyByPush: boolean;
  createdAt: Date;
  updatedAt: Date;
}
