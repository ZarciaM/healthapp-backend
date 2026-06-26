import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeStrings = z
  .array(z.string())
  .min(1, "At least one time is required")
  .refine((arr) => arr.every((t) => timeRegex.test(t)), {
    message: "Each time must be in HH:mm format",
  });

export const createMedicationReminderSchema = z.object({
  medicationName: z
    .string()
    .trim()
    .min(1, "medicationName is required"),
  dosage: z
    .string()
    .trim()
    .optional(),
  times: timeStrings,
  startDate: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), {
      message: "startDate must be a valid date",
    }),
  endDate: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), {
      message: "endDate must be a valid date",
    })
    .optional(),
  notifyByEmail: z
    .boolean()
    .default(true)
    .optional(),
  notifyByPush: z
    .boolean()
    .default(true)
    .optional(),
}).refine(
  (data) => {
    if (!data.endDate) return true;
    return new Date(data.endDate) > new Date(data.startDate);
  },
  { message: "endDate must be after startDate", path: ["endDate"] },
);

export const updateMedicationReminderSchema = z.object({
  medicationName: z
    .string()
    .trim()
    .min(1)
    .optional(),
  dosage: z
    .string()
    .trim()
    .optional(),
  times: timeStrings.optional(),
  startDate: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), {
      message: "startDate must be a valid date",
    })
    .optional(),
  endDate: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), {
      message: "endDate must be a valid date",
    })
    .optional()
    .nullable(),
  notifyByEmail: z
    .boolean()
    .optional(),
  notifyByPush: z
    .boolean()
    .optional(),
});
