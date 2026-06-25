import mongoose, { Schema } from "mongoose";
import type { IHeartRateEntry } from "./heartRate.types.js";

const heartRateEntrySchema = new Schema<IHeartRateEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bpm: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    context: {
      type: String,
      enum: ["resting", "after_exercise", "other"],
      default: "resting",
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

heartRateEntrySchema.index({ userId: 1, recordedAt: -1 });

export default mongoose.model<IHeartRateEntry>(
  "HeartRateEntry",
  heartRateEntrySchema,
);
