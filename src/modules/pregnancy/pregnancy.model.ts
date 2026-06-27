import mongoose, { Schema } from "mongoose";
import type { IPregnancyProfile, CalculationMethod } from "./pregnancy.types.js";

const pregnancyProfileSchema = new Schema<IPregnancyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    calculationMethod: {
      type: String,
      enum: ["lmp", "conception"] satisfies CalculationMethod[],
      required: true,
    },
    lastMenstrualPeriod: {
      type: Date,
    },
    conceptionDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

pregnancyProfileSchema.index(
  { userId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

export default mongoose.model<IPregnancyProfile>("PregnancyProfile", pregnancyProfileSchema);
