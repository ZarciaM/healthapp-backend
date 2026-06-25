import { z } from "zod";
import { createBmiEntrySchema } from "../bmi/bmi.validation.js";

export const createWeightEntrySchema = createBmiEntrySchema;

export const setWeightGoalSchema = z.object({
  targetWeight: z
    .number()
    .min(20, "Le poids cible doit être compris entre 20 et 300 kg")
    .max(300, "Le poids cible doit être compris entre 20 et 300 kg"),
  targetDate: z
    .string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), "Date invalide")
    .refine(
      (date) => date > new Date(),
      "La date cible doit être dans le futur",
    )
    .optional(),
});

export type CreateWeightEntryInput = z.infer<typeof createWeightEntrySchema>;
export type SetWeightGoalInput = z.infer<typeof setWeightGoalSchema>;
