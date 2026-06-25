import { z } from "zod";

export const calculateWaterQuerySchema = z.object({
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
  climate: z.enum(["normal", "hot"]).optional().default("normal"),
});

export type CalculateWaterQueryInput = z.infer<
  typeof calculateWaterQuerySchema
>;
