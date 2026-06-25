export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "male" | "female";
}): number {
  const { weightKg, heightCm, age, gender } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === "male" ? base + 5 : base - 161;
  return Math.round(bmr);
}

export function getActivityMultiplier(
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return multipliers[activityLevel];
}

export function calculateTDEE(
  bmr: number,
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
): number {
  return Math.round(bmr * getActivityMultiplier(activityLevel));
}

export function adjustCaloriesForGoal(
  tdee: number,
  goal: "lose_weight" | "gain_weight" | "maintain" | "general_health",
  gender: "male" | "female" = "male"
): { calories: number; message: string } {
  const floor = gender === "female" ? 1200 : 1500;

  let calories: number;
  let message: string;

  switch (goal) {
    case "lose_weight":
      calories = Math.round(tdee - 500);
      message =
        "Un déficit modéré de 500 kcal par jour est recommandé pour une perte de poids progressive et durable.";
      break;
    case "gain_weight":
      calories = Math.round(tdee + 500);
      message =
        "Un surplus modéré de 500 kcal par jour est recommandé pour une prise de poids progressive.";
      break;
    case "maintain":
    case "general_health":
    default:
      calories = Math.round(tdee);
      message =
        "Ce maintien calorique correspond à vos besoins énergétiques quotidiens estimés.";
      break;
  }

  if (calories < floor) {
    calories = floor;
    message +=
      " Nous avons ajusté cette recommandation à un minimum sain. Consultez un professionnel de santé pour un suivi personnalisé.";
  }

  return { calories, message };
}

export function calculateBaseWaterNeed(weightKg: number): number {
  return Math.round(weightKg * 35);
}

const WATER_ACTIVITY_BONUSES: Record<
  "sedentary" | "light" | "moderate" | "active" | "very_active",
  number
> = {
  sedentary: 0,
  light: 150,
  moderate: 350,
  active: 600,
  very_active: 900,
};

export function getActivityWaterBonus(
  activityLevel: string,
): number {
  return WATER_ACTIVITY_BONUSES[activityLevel as keyof typeof WATER_ACTIVITY_BONUSES] ?? 0;
}

export function getClimateWaterBonus(climate: "normal" | "hot"): number {
  return climate === "hot" ? 500 : 0;
}

export function calculateDailyWaterNeed(params: {
  weightKg: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  climate: "normal" | "hot";
}): {
  totalMl: number;
  breakdown: { base: number; activityBonus: number; climateBonus: number };
  message: string;
} {
  const { weightKg, activityLevel, climate } = params;

  const base = calculateBaseWaterNeed(weightKg);
  const activityBonus = getActivityWaterBonus(activityLevel);
  const climateBonus = getClimateWaterBonus(climate);

  const rawTotal = base + activityBonus + climateBonus;

  let totalMl: number;
  let message: string;

  if (rawTotal > 5000) {
    totalMl = 5000;
    message =
      "Vos besoins hydriques estimés dépassent un volume raisonnable. Consultez un professionnel de santé pour un suivi personnalisé de votre hydratation.";
  } else if (rawTotal < 1500) {
    totalMl = 1500;
    message =
      "Nous avons ajusté cette recommandation à un minimum sain d'hydratation. Consultez un professionnel de santé pour un suivi personnalisé.";
  } else {
    totalMl = rawTotal;
    message = "Cette recommandation correspond à vos besoins hydriques quotidiens estimés.";
  }

  if (climate === "hot") {
    message += " Pensez à augmenter votre hydratation par temps chaud.";
  }

  return { totalMl, breakdown: { base, activityBonus, climateBonus }, message };
}

export function getBMICategory(bmi: number): { category: string; message: string } {
  if (bmi < 18.5) {
    return {
      category: "insuffisance_ponderale",
      message:
        "Votre IMC suggère une insuffisance pondérale. Il est conseillé d'en parler avec un professionnel de santé.",
    };
  }

  if (bmi < 25) {
    return {
      category: "poids_normal",
      message:
        "Votre IMC est dans la norme. Continuez à maintenir de bonnes habitudes.",
    };
  }

  if (bmi < 30) {
    return {
      category: "surpoids",
      message:
        "Votre IMC suggère un surpoids. Un professionnel de santé peut vous accompagner si besoin.",
    };
  }

  return {
    category: "obesite",
    message:
      "Votre IMC suggère une obésité. Nous vous recommandons de consulter un professionnel de santé.",
  };
}
