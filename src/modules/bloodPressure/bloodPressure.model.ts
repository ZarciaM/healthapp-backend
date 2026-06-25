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
      min: 50,
      max: 250,
    },
    diastolic: {
      type: Number,
      required: true,
      min: 30,
      max: 150,
      validate: {
        validator(this: unknown, value: number) {
          return value - (this as { systolic: number }).systolic <= 10;
        },
        message: "La pression diastolique dépasse anormalement la pression systolique. Vérifiez les valeurs saisies.",
      },
    },
    pulse: {
      type: Number,
      required: true,
      min: 30,
      max: 220,
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
