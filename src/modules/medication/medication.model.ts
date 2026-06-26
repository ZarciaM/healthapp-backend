import mongoose, { Schema } from "mongoose";
import type { IMedicationReminder } from "./medication.types.js";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const medicationReminderSchema = new Schema<IMedicationReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicationName: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
    },
    times: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) =>
          Array.isArray(v) && v.length > 0 && v.every((t) => timeRegex.test(t)),
        message: "Each time must be in HH:mm format and at least one time is required",
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (this: IMedicationReminder, v: Date) {
          if (!v) return true;
          return v > this.startDate;
        },
        message: "endDate must be after startDate",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notifyByEmail: {
      type: Boolean,
      default: true,
    },
    notifyByPush: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

medicationReminderSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IMedicationReminder>(
  "MedicationReminder",
  medicationReminderSchema,
);
