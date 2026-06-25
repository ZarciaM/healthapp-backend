import mongoose, { Schema } from "mongoose";
import type { IBloodPressureEntry } from "./bloodPressure.types.js";

const bloodPressureEntrySchema = new Schema<IBloodPressureEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    systolic: {
      type: Number,
      required: true,
    },
    diastolic: {
      type: Number,
      required: true,
    },
    pulse: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      required: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

bloodPressureEntrySchema.index({ userId: 1, recordedAt: -1 });

export default mongoose.model<IBloodPressureEntry>(
  "BloodPressureEntry",
  bloodPressureEntrySchema,
);
