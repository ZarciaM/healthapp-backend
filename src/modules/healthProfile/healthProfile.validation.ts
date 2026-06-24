import { z } from "zod";

export function getTotalSteps(gender: "male" | "female"): number {
  return gender === "female" ? 5 : 4;
}

export const step1Schema = z.object({
  height: z
    .number()
    .min(50, "La taille doit être comprise entre 50 et 250 cm")
    .max(250, "La taille doit être comprise entre 50 et 250 cm"),
  currentWeight: z
    .number()
    .min(20, "Le poids doit être compris entre 20 et 300 kg")
    .max(300, "Le poids doit être compris entre 20 et 300 kg"),
});

export const step2Schema = z.object({
  activityLevel: z.enum(
    ["sedentary", "light", "moderate", "active", "very_active"],
    { error: "Niveau d'activité invalide" },
  ),
  goal: z.enum(
    ["lose_weight", "gain_weight", "maintain", "general_health"],
    { error: "Objectif invalide" },
  ),
});

const stringArray = z
  .array(z.string())
  .max(20, "Maximum 20 éléments autorisés");

export const step3Schema = z.object({
  medicalHistory: z.object({
    hypertension: z.boolean(),
    diabetes: z.boolean(),
    allergies: stringArray,
    currentMedications: stringArray,
  }),
});

export const step4Schema = z.object({
  lifestyle: z.object({
    averageSleepHours: z
      .number()
      .min(0, "Les heures de sommeil doivent être entre 0 et 24")
      .max(24, "Les heures de sommeil doivent être entre 0 et 24"),
    smoker: z.boolean(),
    alcoholConsumption: z.enum(["none", "occasional", "regular"], {
      error: "Consommation d'alcool invalide",
    }),
  }),
});

export const step5WomenSchema = z.object({
  womenSpecific: z.object({
    cycleRegularity: z.enum(["regular", "irregular"], {
      error: "Régularité du cycle invalide",
    }),
    lastPeriodDate: z
      .string()
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), "Date invalide")
      .refine(
        (date) => date <= new Date(),
        "La date ne peut pas être dans le futur",
      ),
    averageCycleLength: z
      .number()
      .min(15, "La durée du cycle doit être entre 15 et 45 jours")
      .max(45, "La durée du cycle doit être entre 15 et 45 jours"),
  }),
});

const stepSchemas: Record<number, z.ZodObject<z.ZodRawShape>> = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
};

export function getStepSchema(
  step: number,
  gender: "male" | "female",
): z.ZodType<unknown> {
  if (step === 5) {
    if (gender !== "female") {
      return z.object({});
    }
    return step5WomenSchema;
  }

  const schema = stepSchemas[step];
  if (!schema) {
    throw new Error(`Étape invalide : ${step}`);
  }
  return schema;
}

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type Step5WomenInput = z.infer<typeof step5WomenSchema>;
