import type { Types } from "mongoose";

export interface IMedicationReminder {
  userId: Types.ObjectId;
  medicationName: string;
  dosage?: string;
  times: string[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  notifyByEmail: boolean;
  notifyByPush: boolean;
  createdAt: Date;
  updatedAt: Date;
}
