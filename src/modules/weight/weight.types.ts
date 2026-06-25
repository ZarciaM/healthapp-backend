import type { Types } from "mongoose";

export interface IWeightGoal {
  userId: Types.ObjectId;
  targetWeight: number;
  targetDate?: Date;
  startingWeight: number;
  createdAt: Date;
  updatedAt: Date;
}
