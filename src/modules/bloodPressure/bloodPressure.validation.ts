import { z } from "zod";

export const createBloodPressureEntrySchema = z
  .object({
    systolic: z
      .number()
      .int("La pression systolique doit être un nombre entier")
      .min(50, "La pression systolique doit être comprise entre 50 et 250 mmHg")
      .max(250, "La pression systolique doit être comprise entre 50 et 250 mmHg"),
    diastolic: z
      .number()
      .int("La pression diastolique doit être un nombre entier")
      .min(30, "La pression diastolique doit être comprise entre 30 et 150 mmHg")
      .max(150, "La pression diastolique doit être comprise entre 30 et 150 mmHg"),
    pulse: z
      .number()
      .int("Le pouls doit être un nombre entier")
      .min(30, "Le pouls doit être compris entre 30 et 220 bpm")
      .max(220, "Le pouls doit être compris entre 30 et 220 bpm"),
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
  .refine((data) => data.diastolic - data.systolic <= 10, {
    message:
      "La pression diastolique dépasse anormalement la pression systolique. Vérifiez les valeurs saisies.",
  });

export type CreateBloodPressureEntryInput = z.infer<
  typeof createBloodPressureEntrySchema
>;
