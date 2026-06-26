import { z } from "zod";

export const createBodyFatEntrySchema = z
  .object({
    neckCm: z
      .number("Le tour de cou doit être un nombre")
      .min(20, "Le tour de cou doit être compris entre 20 et 60 cm")
      .max(60, "Le tour de cou doit être compris entre 20 et 60 cm"),
    waistCm: z
      .number("Le tour de taille doit être un nombre")
      .min(40, "Le tour de taille doit être compris entre 40 et 200 cm")
      .max(200, "Le tour de taille doit être compris entre 40 et 200 cm"),
    hipCm: z
      .number("Le tour de hanches doit être un nombre")
      .min(40, "Le tour de hanches doit être compris entre 40 et 200 cm")
      .max(200, "Le tour de hanches doit être compris entre 40 et 200 cm")
      .optional(),
    heightCm: z
      .number("La taille doit être un nombre")
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
  })
  .refine((data) => data.waistCm > data.neckCm, {
    message:
      "Le tour de taille doit être supérieur au tour de cou pour effectuer le calcul de la graisse corporelle.",
    path: ["waistCm"],
  });

export type CreateBodyFatEntryInput = z.infer<typeof createBodyFatEntrySchema>;
