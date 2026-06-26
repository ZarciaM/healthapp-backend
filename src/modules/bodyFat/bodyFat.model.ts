import mongoose, { Schema } from "mongoose";
import type { IBodyFatEntry } from "./bodyFat.types.js";

const bodyFatEntrySchema = new Schema<IBodyFatEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    neckCm: {
      type: Number,
      required: true,
    },
    waistCm: {
      type: Number,
      required: true,
    },
    hipCm: {
      type: Number,
    },
    heightCm: {
      type: Number,
      required: true,
    },
    bodyFatPercent: {
      type: Number,
      required: true,
    },
    category: {
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

bodyFatEntrySchema.index({ userId: 1, recordedAt: -1 });

export default mongoose.model<IBodyFatEntry>(
  "BodyFatEntry",
  bodyFatEntrySchema,
);
