import mongoose, { Schema } from "mongoose";
import type { IHydrationReminder } from "./hydration.types.js";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const hydrationReminderSchema = new Schema<IHydrationReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    mode: {
      type: String,
      enum: ["fixed_times", "interval"],
      required: true,
    },
    times: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) =>
          Array.isArray(v) && v.length > 0 && v.every((t) => timeRegex.test(t)),
        message:
          "Each time must be in HH:mm format and at least one time is required",
      },
    },
    intervalConfig: {
      type: {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        intervalHours: { type: Number, required: true },
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

export default mongoose.model<IHydrationReminder>(
  "HydrationReminder",
  hydrationReminderSchema,
);
