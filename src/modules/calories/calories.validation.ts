import { z } from "zod";

export const calculateCaloriesQuerySchema = z.object({
  weight: z
    .string()
    .transform((val) => Number(val))
    .pipe(
      z
        .number()
        .min(20, "Le poids doit être compris entre 20 et 300 kg")
        .max(300, "Le poids doit être compris entre 20 et 300 kg"),
    )
    .optional(),
  height: z
    .string()
    .transform((val) => Number(val))
    .pipe(
      z
        .number()
        .min(50, "La taille doit être comprise entre 50 et 250 cm")
        .max(250, "La taille doit être comprise entre 50 et 250 cm"),
    )
    .optional(),
});

export type CalculateCaloriesQueryInput = z.infer<
  typeof calculateCaloriesQuerySchema
>;
