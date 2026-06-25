import mongoose, { Schema } from "mongoose";
import type { ISleepEntry } from "./sleep.types.js";
import { SLEEP_QUALITY_VALUES } from "./sleep.types.js";

const sleepEntrySchema = new Schema<ISleepEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bedTime: {
      type: Date,
      required: true,
    },
    wakeTime: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    quality: {
      type: Number,
      required: true,
      enum: SLEEP_QUALITY_VALUES,
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

sleepEntrySchema.index({ userId: 1, bedTime: -1 });

export default mongoose.model<ISleepEntry>("SleepEntry", sleepEntrySchema);
