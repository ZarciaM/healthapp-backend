import mongoose, { Schema } from "mongoose";
import type { IBmiEntry } from "./bmi.types.js";

const bmiEntrySchema = new Schema<IBmiEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    bmiValue: {
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

bmiEntrySchema.index({ userId: 1, recordedAt: -1 });

export default mongoose.model<IBmiEntry>("BmiEntry", bmiEntrySchema);
