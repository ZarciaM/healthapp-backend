import { z } from "zod";

export const createHeartRateEntrySchema = z.object({
  bpm: z
    .number()
    .int("Le pouls doit être un nombre entier")
    .min(30, "Le pouls doit être compris entre 30 et 220 bpm")
    .max(220, "Le pouls doit être compris entre 30 et 220 bpm"),
  context: z
    .enum(["resting", "after_exercise", "other"])
    .default("resting")
    .optional(),
  recordedAt: z
    .string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), "Date invalide")
    .refine(
      (date) => date <= new Date(),
      "La date ne peut pas être dans le futur",
    )
    .optional(),
});

export const calculateZonesQuerySchema = z.object({
  age: z
    .number()
    .int("L'âge doit être un nombre entier")
    .min(1, "L'âge doit être compris entre 1 et 150 ans")
    .max(150, "L'âge doit être compris entre 1 et 150 ans")
    .optional(),
  gender: z.enum(["male", "female"]).optional(),
});

export type CreateHeartRateEntryInput = z.infer<
  typeof createHeartRateEntrySchema
>;
export type CalculateZonesQueryInput = z.infer<
  typeof calculateZonesQuerySchema
>;
