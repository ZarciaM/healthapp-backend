import { z } from "zod";
import type { CycleFlow, CycleSymptom } from "./menstrualCycle.types.js";

const cycleFlowValues = ["light", "medium", "heavy"] as const satisfies CycleFlow[];

const cycleSymptomValues = [
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
] as const satisfies CycleSymptom[];

const dateString = z.string().pipe(z.coerce.date());

export const createCycleEntrySchema = z
  .object({
    periodStartDate: dateString.refine(
      (date) => date <= new Date(),
      { message: "periodStartDate cannot be in the future" },
    ),
    periodEndDate: dateString.optional(),
    flow: z.enum(cycleFlowValues).optional(),
    symptoms: z.array(z.enum(cycleSymptomValues)).optional(),
    notes: z.string().max(500, "notes must not exceed 500 characters").optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.periodEndDate) return;

    if (data.periodEndDate <= data.periodStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "periodEndDate must be after periodStartDate",
        path: ["periodEndDate"],
      });
      return;
    }

    const diffDays =
      (data.periodEndDate.getTime() - data.periodStartDate.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diffDays > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "periodEndDate must not exceed 10 days after periodStartDate",
        path: ["periodEndDate"],
      });
    }
  });
