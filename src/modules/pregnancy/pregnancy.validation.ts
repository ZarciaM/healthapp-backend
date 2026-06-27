import { z } from "zod";

function isValidCalendarDate(val: string): boolean {
  const match = val.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!match) return false;
  const [y, m, d] = val.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

const dateString = z
  .string()
  .refine(isValidCalendarDate, "Invalid or impossible date")
  .pipe(z.coerce.date());

function daysAgo(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
}

export const createPregnancyProfileSchema = z
  .object({
    calculationMethod: z.enum(["lmp", "conception"]),
    lastMenstrualPeriod: dateString.optional(),
    conceptionDate: dateString.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.calculationMethod === "lmp") {
      if (!data.lastMenstrualPeriod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "lastMenstrualPeriod is required when calculationMethod is 'lmp'",
          path: ["lastMenstrualPeriod"],
        });
        return;
      }
      if (!(data.lastMenstrualPeriod instanceof Date)) {
        return;
      }
      if (data.lastMenstrualPeriod > new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "lastMenstrualPeriod cannot be in the future",
          path: ["lastMenstrualPeriod"],
        });
        return;
      }
      if (daysAgo(data.lastMenstrualPeriod) > 301) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "lastMenstrualPeriod is more than 43 weeks ago, which is inconsistent with an active pregnancy",
          path: ["lastMenstrualPeriod"],
        });
        return;
      }
      if (data.conceptionDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "conceptionDate must not be provided when calculationMethod is 'lmp'",
          path: ["conceptionDate"],
        });
        return;
      }
    }

    if (data.calculationMethod === "conception") {
      if (!data.conceptionDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "conceptionDate is required when calculationMethod is 'conception'",
          path: ["conceptionDate"],
        });
        return;
      }
      if (!(data.conceptionDate instanceof Date)) {
        return;
      }
      if (data.conceptionDate > new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "conceptionDate cannot be in the future",
          path: ["conceptionDate"],
        });
        return;
      }
      if (daysAgo(data.conceptionDate) > 287) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "conceptionDate is more than 41 weeks ago, which is inconsistent with an active pregnancy",
          path: ["conceptionDate"],
        });
        return;
      }
      if (data.lastMenstrualPeriod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "lastMenstrualPeriod must not be provided when calculationMethod is 'conception'",
          path: ["lastMenstrualPeriod"],
        });
        return;
      }
    }
  });
