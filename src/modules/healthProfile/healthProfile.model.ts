import mongoose, { Schema } from "mongoose";
import type { IHealthProfile } from "./healthProfile.types.js";

const medicalHistorySchema = new Schema(
  {
    hypertension: { type: Boolean, default: false },
    diabetes: { type: Boolean, default: false },
    allergies: { type: [String], default: [] },
    currentMedications: { type: [String], default: [] },
  },
  { _id: false },
);

const lifestyleSchema = new Schema(
  {
    averageSleepHours: { type: Number },
    smoker: { type: Boolean },
    alcoholConsumption: {
      type: String,
      enum: ["none", "occasional", "regular"],
    },
  },
  { _id: false },
);

const womenSpecificSchema = new Schema(
  {
    cycleRegularity: {
      type: String,
      enum: ["regular", "irregular"],
    },
    lastPeriodDate: { type: Date },
    averageCycleLength: { type: Number },
  },
  { _id: false },
);

const healthProfileSchema = new Schema<IHealthProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    height: { type: Number },
    currentWeight: { type: Number },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
    },
    goal: {
      type: String,
      enum: ["lose_weight", "gain_weight", "maintain", "general_health"],
    },
    medicalHistory: {
      type: medicalHistorySchema,
      default: () => ({
        hypertension: false,
        diabetes: false,
        allergies: [],
        currentMedications: [],
      }),
    },
    lifestyle: { type: lifestyleSchema },
    womenSpecific: { type: womenSpecificSchema },
    onboardingStep: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

healthProfileSchema.pre("save", function () {
  const requiredFields = [
    this.height,
    this.currentWeight,
    this.activityLevel,
    this.goal,
  ];

  const allPresent = requiredFields.every(
    (field) => field !== undefined && field !== null,
  );

  if (allPresent) {
    this.isCompleted = true;
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else {
    this.isCompleted = false;
    this.completedAt = undefined;
  }
});

export default mongoose.model<IHealthProfile>(
  "HealthProfile",
  healthProfileSchema,
);
