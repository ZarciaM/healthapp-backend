import { z } from "zod";
import { SLEEP_QUALITY_VALUES } from "./sleep.types.js";

export const createSleepEntrySchema = z
  .object({
    bedTime: z
      .string()
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), "Date de coucher invalide")
      .refine(
        (date) => date <= new Date(),
        "La date de coucher ne peut pas être dans le futur",
      ),
    wakeTime: z
      .string()
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), "Date de réveil invalide")
      .refine(
        (date) => date <= new Date(),
        "La date de réveil ne peut pas être dans le futur",
      ),
    quality: z.union(
      SLEEP_QUALITY_VALUES.map((v) => z.literal(v)) as [
        z.ZodLiteral<1>,
        z.ZodLiteral<2>,
        z.ZodLiteral<3>,
        z.ZodLiteral<4>,
        z.ZodLiteral<5>,
      ],
    ),
  })
  .refine((data) => data.wakeTime > data.bedTime, {
    message: "L'heure de réveil doit être après l'heure de coucher",
  })
  .refine(
    (data) => {
      const diffMs = data.wakeTime.getTime() - data.bedTime.getTime();
      return diffMs <= 24 * 60 * 60 * 1000;
    },
    {
      message:
        "La durée entre le coucher et le réveil ne peut pas dépasser 24 heures",
    },
  );

export type CreateSleepEntryInput = z.infer<typeof createSleepEntrySchema>;
