import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeString = z.string().regex(timeRegex, "Time must be in HH:mm format");

export const createHydrationReminderSchema = z
  .object({
    mode: z.enum(["fixed_times", "interval"]),
    times: z.array(timeString).optional(),
    intervalConfig: z
      .object({
        startTime: timeString,
        endTime: timeString,
        intervalHours: z
          .number()
          .min(0.5, "Interval must be at least 0.5 hours")
          .max(6, "Interval must not exceed 6 hours"),
      })
      .optional(),
    notifyByEmail: z.boolean().optional().default(true),
    notifyByPush: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "fixed_times") {
      if (!data.times || data.times.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "times is required when mode is 'fixed_times' and must contain at least one time",
          path: ["times"],
        });
      }
      if (data.intervalConfig) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "intervalConfig must not be provided when mode is 'fixed_times'",
          path: ["intervalConfig"],
        });
      }
    }

    if (data.mode === "interval") {
      if (data.times) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "times must not be provided directly when mode is 'interval'; it will be generated from intervalConfig",
          path: ["times"],
        });
      }
      if (!data.intervalConfig) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "intervalConfig is required when mode is 'interval'",
          path: ["intervalConfig"],
        });
      }
    }
  });

export type CreateHydrationReminderInput = z.infer<
  typeof createHydrationReminderSchema
>;
