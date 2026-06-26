import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  gender: z.enum(["male", "female"], { message: "Genre invalide" }),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)")
    .transform((val) => {
      const [y, m, d] = val.split("-").map(Number);
      return { year: y, month: m, day: d };
    })
    .refine(({ year, month, day }) => {
      const today = new Date();
      const age = today.getFullYear() - year;
      const monthDiff = today.getMonth() + 1 - month;
      const dayDiff = today.getDate() - day;
      const adjustedAge =
        monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0) ? age : age - 1;
      return adjustedAge >= 13;
    }, "Vous devez avoir au moins 13 ans")
    .transform(({ year, month, day }) => new Date(year, month - 1, day)),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const ianaTimeZones = Intl.supportedValuesOf("timeZone");

export const updateTimezoneSchema = z.object({
  timezone: z
    .string()
    .trim()
    .min(1, "timezone is required")
    .refine((tz) => ianaTimeZones.includes(tz), {
      message: "Invalid IANA timezone identifier",
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
