import { z } from "zod";

export const createBmiEntrySchema = z.object({
  weight: z
    .number()
    .min(20, "Le poids doit être compris entre 20 et 300 kg")
    .max(300, "Le poids doit être compris entre 20 et 300 kg"),
  height: z
    .number()
    .min(50, "La taille doit être comprise entre 50 et 250 cm")
    .max(250, "La taille doit être comprise entre 50 et 250 cm"),
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

export type CreateBmiEntryInput = z.infer<typeof createBmiEntrySchema>;
