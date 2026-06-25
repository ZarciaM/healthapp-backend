import mongoose, { Schema } from "mongoose";
import type { IWeightGoal } from "./weight.types.js";

const weightGoalSchema = new Schema<IWeightGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    targetWeight: {
      type: Number,
      required: true,
    },
    targetDate: {
      type: Date,
    },
    startingWeight: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IWeightGoal>("WeightGoal", weightGoalSchema);
