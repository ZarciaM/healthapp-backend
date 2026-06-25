import { z } from "zod";

const weightField = z
  .string()
  .transform((val) => Number(val))
  .pipe(
    z
      .number()
      .min(20, "Le poids doit être compris entre 20 et 300 kg")
      .max(300, "Le poids doit être compris entre 20 et 300 kg"),
  );

const heightField = z
  .string()
  .transform((val) => Number(val))
  .pipe(
    z
      .number()
      .min(50, "La taille doit être comprise entre 50 et 250 cm")
      .max(250, "La taille doit être comprise entre 50 et 250 cm"),
  );

export const calculateCaloriesQuerySchema = z
  .object({
    weight: weightField.optional(),
    height: heightField.optional(),
  })
  .superRefine((data, ctx) => {
    const hasWeight = data.weight !== undefined;
    const hasHeight = data.height !== undefined;
    if (hasWeight !== hasHeight) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Les paramètres weight et height doivent être fournis ensemble pour surcharger les valeurs du profil",
        path: [hasWeight ? "height" : "weight"],
      });
    }
  });

export type CalculateCaloriesQueryInput = z.infer<
  typeof calculateCaloriesQuerySchema
>;
