import mongoose, { Schema } from "mongoose";
import type { ICycleEntry, CycleSymptom, CycleFlow } from "./menstrualCycle.types.js";

const cycleSymptoms: CycleSymptom[] = [
  "cramps",
  "headache",
  "fatigue",
  "bloating",
  "breast_tenderness",
  "mood_swings",
  "nausea",
  "back_pain",
  "acne",
  "spotting",
  "insomnia",
  "dizziness",
];

const cycleEntrySchema = new Schema<ICycleEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    periodStartDate: {
      type: Date,
      required: true,
    },
    periodEndDate: {
      type: Date,
    },
    flow: {
      type: String,
      enum: ["light", "medium", "heavy"] satisfies CycleFlow[],
    },
    symptoms: {
      type: [String],
      enum: cycleSymptoms,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

cycleEntrySchema.index({ userId: 1, periodStartDate: 1 }, { unique: true });

export default mongoose.model<ICycleEntry>("CycleEntry", cycleEntrySchema);
