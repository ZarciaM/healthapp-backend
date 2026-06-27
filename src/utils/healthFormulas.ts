import { ApiError } from "./ApiError.js";

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

export function calculateSleepDuration(bedTime: Date, wakeTime: Date): number {
  if (wakeTime <= bedTime) {
    throw ApiError.badRequest(
      "Le réveil doit être postérieur au coucher. Vérifiez les dates fournies."
    );
  }

  const diffMs = wakeTime.getTime() - bedTime.getTime();
  return Math.floor(diffMs / 60000);
}

import type { SleepQuality } from "../modules/sleep/sleep.types.js";

export function getSleepQualityLabel(quality: SleepQuality): string {
  const labels: Record<SleepQuality, string> = {
    1: "Très mauvaise",
    2: "Mauvaise",
    3: "Moyenne",
    4: "Bonne",
    5: "Excellente",
  };
  return labels[quality];
}

export function getSleepDurationFeedback(durationMinutes: number): {
  message: string;
  isHealthyRange: boolean;
} {
  if (durationMinutes < 420) {
    return {
      message:
        "Votre sommeil est inférieur aux recommandations habituelles (7 à 9 heures). Un sommeil plus long pourrait être bénéfique.",
      isHealthyRange: false,
    };
  }

  if (durationMinutes <= 540) {
    return {
      message:
        "Votre durée de sommeil se situe dans la plage généralement recommandée pour un adulte. Continuez ainsi.",
      isHealthyRange: true,
    };
  }

  return {
    message:
      "Votre durée de sommeil est supérieure aux recommandations habituelles. Cela peut être normal selon vos besoins ou votre âge.",
    isHealthyRange: false,
  };
}

export function getBloodPressureCategory(
  systolic: number,
  diastolic: number,
): {
  category: string;
  severity: "normal" | "elevated" | "high" | "critical";
  message: string;
} {
  const categories = [
    {
      match: () => systolic >= 180 || diastolic >= 120,
      category: "crise_hypertensive",
      severity: "critical" as const,
      message:
        "Ces valeurs nécessitent une attention médicale rapide. Si vous ressentez des symptômes (maux de tête sévères, essoufflement, douleur thoracique), contactez immédiatement un service d'urgence.",
    },
    {
      match: () => (systolic >= 140 && systolic <= 179) || (diastolic >= 90 && diastolic <= 119),
      category: "hypertension_stade_2",
      severity: "high" as const,
      message:
        "Vos valeurs suggèrent une hypertension de stade 2. Une consultation médicale est recommandée.",
    },
    {
      match: () => (systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89),
      category: "hypertension_stade_1",
      severity: "high" as const,
      message:
        "Vos valeurs suggèrent une hypertension de stade 1. Nous vous recommandons d'en parler à un professionnel de santé.",
    },
    {
      match: () => systolic < 90 || diastolic < 60,
      category: "hypotension",
      severity: "elevated" as const,
      message:
        "Votre tension est plus basse que la moyenne. Si vous ressentez des vertiges ou malaises, parlez-en à un professionnel de santé.",
    },
    {
      match: () => systolic >= 120 && systolic <= 129 && diastolic < 80,
      category: "elevee",
      severity: "elevated" as const,
      message:
        "Votre tension est légèrement élevée. Continuez à surveiller et maintenez de bonnes habitudes.",
    },
    {
      match: () => systolic < 120 && diastolic < 80,
      category: "normale",
      severity: "normal" as const,
      message: "Votre tension est dans les valeurs normales.",
    },
  ];

  for (const entry of categories) {
    if (entry.match()) {
      return {
        category: entry.category,
        severity: entry.severity,
        message: entry.message,
      };
    }
  }

  return {
    category: "normale",
    severity: "normal" as const,
    message: "Votre tension est dans les valeurs normales.",
  };
}

export function getPulseCategory(bpm: number): { category: string; message: string } {
  if (bpm < 60) {
    return {
      category: "bradycardie",
      message:
        "Votre pouls est inférieur à la normale au repos. Si vous ressentez des symptômes (fatigue, étourdissements), parlez-en à un professionnel de santé.",
    };
  }

  if (bpm <= 100) {
    return {
      category: "normal",
      message: "Votre pouls est dans les valeurs normales au repos.",
    };
  }

  return {
    category: "tachycardie",
    message:
      "Votre pouls est plus élevé que la normale au repos. Si cela persiste, une consultation médicale est recommandée.",
  };
}

/**
 * Gulati (2010) est la formule la plus utilisée dans l'industrie pour
 * les femmes mais sa précision est débattue dans la littérature
 * scientifique récente. Tanaka (2001) est proposée en complément car
 * plus généralement validée sur une large population.
 */
export function calculateMaxHeartRate(
  age: number,
  gender: "male" | "female",
): {
  primary: number;
  formula: string;
  alternative: { value: number; formula: string };
} {
  const alternative = {
    value: Math.round(208 - 0.7 * age),
    formula: "Tanaka",
  };

  if (gender === "female") {
    return {
      primary: Math.round(206 - 0.88 * age),
      formula: "Gulati",
      alternative,
    };
  }

  return {
    primary: Math.round(220 - age),
    formula: "Fox",
    alternative,
  };
}

export function calculateHeartRateZones(maxHeartRate: number): {
  zone1_warmup: { min: number; max: number; label: string };
  zone2_fatBurn: { min: number; max: number; label: string };
  zone3_cardio: { min: number; max: number; label: string };
  zone4_hardcore: { min: number; max: number; label: string };
  zone5_peak: { min: number; max: number; label: string };
} {
  return {
    zone1_warmup: {
      min: Math.round(maxHeartRate * 0.5),
      max: Math.round(maxHeartRate * 0.6),
      label: "Échauffement",
    },
    zone2_fatBurn: {
      min: Math.round(maxHeartRate * 0.6),
      max: Math.round(maxHeartRate * 0.7),
      label: "Combustion des graisses",
    },
    zone3_cardio: {
      min: Math.round(maxHeartRate * 0.7),
      max: Math.round(maxHeartRate * 0.8),
      label: "Cardio",
    },
    zone4_hardcore: {
      min: Math.round(maxHeartRate * 0.8),
      max: Math.round(maxHeartRate * 0.9),
      label: "Intensité élevée",
    },
    zone5_peak: {
      min: Math.round(maxHeartRate * 0.9),
      max: Math.round(maxHeartRate * 1.0),
      label: "Zone maximale",
    },
  };
}

/**
 * Calcule le pourcentage de graisse corporelle avec la formule US Navy
 * (Hodgdon & Beckett, 1984, Naval Health Research Center).
 *
 * ATTENTION — CONVERSION D'UNITÉS :
 * La formule officielle originale est définie en POUCES. Toutes les mesures
 * d'entrée sont en centimètres (cohérence avec les autres modules : IMC,
 * poids, taille). On convertit donc les centimètres en pouces (÷ 2.54)
 * avant d'appliquer la formule, plutôt que d'utiliser des coefficients
 * métriques alternatifs moins universellement vérifiés.
 *
 * Homme  : BF% = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
 * Femme  : BF% = 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
 */
export function calculateBodyFatPercentage(params: {
  gender: "male" | "female";
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
}): number {
  const CM_TO_INCH = 2.54;

  const heightIn = params.heightCm / CM_TO_INCH;
  const neckIn = params.neckCm / CM_TO_INCH;
  const waistIn = params.waistCm / CM_TO_INCH;

  if (params.gender === "female") {
    if (params.hipCm === undefined) {
      throw ApiError.badRequest(
        "Le tour de hanches (hipCm) est requis pour le calcul du pourcentage de graisse corporelle chez la femme.",
      );
    }
    const hipIn = params.hipCm / CM_TO_INCH;
    const bf =
      163.205 * Math.log10(waistIn + hipIn - neckIn) -
      97.684 * Math.log10(heightIn) -
      78.387;
    return Math.round(bf * 10) / 10;
  }

  const bf =
    86.01 * Math.log10(waistIn - neckIn) -
    70.041 * Math.log10(heightIn) +
    36.76;
  return Math.round(bf * 10) / 10;
}

function daysBetween(a: Date, b: Date): number {
  const diffMs = Math.abs(b.getTime() - a.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateCycleLength(
  cycleStartDates: Date[],
): { averageLength: number | null; isRegular: boolean; confidenceLevel: "low" | "medium" | "high" } {
  if (cycleStartDates.length < 2) {
    return { averageLength: null, isRegular: false, confidenceLevel: "low" };
  }

  const lengths: number[] = [];
  for (let i = 1; i < cycleStartDates.length; i++) {
    lengths.push(daysBetween(cycleStartDates[i - 1], cycleStartDates[i]));
  }

  const sum = lengths.reduce((a, b) => a + b, 0);
  const averageLength = Math.round((sum / lengths.length) * 10) / 10;

  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  const isRegular = max - min <= 7;

  const numCycles = lengths.length;
  let confidenceLevel: "low" | "medium" | "high";
  if (numCycles < 3 || !isRegular) {
    confidenceLevel = "low";
  } else if (numCycles <= 5) {
    confidenceLevel = "medium";
  } else {
    confidenceLevel = "high";
  }

  return { averageLength, isRegular, confidenceLevel };
}

export function predictNextPeriod(
  lastPeriodStart: Date,
  averageCycleLength: number,
  confidenceLevel: "low" | "medium" | "high",
): { estimatedDate: Date; rangeStart: Date; rangeEnd: Date } {
  const estimatedDate = addDays(lastPeriodStart, averageCycleLength);

  const offset = confidenceLevel === "high" ? 2 : confidenceLevel === "medium" ? 4 : 7;

  return {
    estimatedDate,
    rangeStart: addDays(estimatedDate, -offset),
    rangeEnd: addDays(estimatedDate, offset),
  };
}

export function predictFertileWindow(
  lastPeriodStart: Date,
  averageCycleLength: number,
  confidenceLevel: "low" | "medium" | "high",
): {
  estimatedOvulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  confidenceLevel: string;
  disclaimer: string;
} {
  const estimatedOvulationDate = addDays(lastPeriodStart, averageCycleLength - 14);

  const offset = confidenceLevel === "high" ? 2 : confidenceLevel === "medium" ? 4 : 7;

  return {
    estimatedOvulationDate,
    fertileWindowStart: addDays(estimatedOvulationDate, -5 - offset),
    fertileWindowEnd: addDays(estimatedOvulationDate, 1 + offset),
    confidenceLevel,
    disclaimer:
      "Cette estimation est basée sur un calcul calendaire et ne constitue pas une méthode fiable de contraception ou de conception. Les cycles naturels varient et l'ovulation peut survenir à des dates différentes de cette estimation. Consultez un professionnel de santé pour des méthodes de suivi de fertilité plus précises si nécessaire.",
  };
}

export function calculateDueDateFromLMP(lastMenstrualPeriod: Date): Date {
  return addDays(lastMenstrualPeriod, 280);
}

export function calculateDueDateFromConception(conceptionDate: Date): Date {
  return addDays(conceptionDate, 266);
}

export type GestationalAgeResult = {
  weeks: number;
  days: number;
  trimester: 1 | 2 | 3;
  anomaly: "post_term" | "pre_conception" | null;
};

export function calculateGestationalAge(
  dueDate: Date,
  referenceDate: Date = new Date(),
): GestationalAgeResult {
  const msPerDay = 1000 * 60 * 60 * 24;
  const remainingDays = (dueDate.getTime() - referenceDate.getTime()) / msPerDay;
  const totalDays = 280 - remainingDays;

  let anomaly: GestationalAgeResult["anomaly"] = null;

  if (totalDays < 0) {
    anomaly = "pre_conception";
  } else if (remainingDays < -14) {
    anomaly = "post_term";
  }

  const clamped = Math.max(0, totalDays);
  const weeks = Math.floor(clamped / 7);
  const days = Math.round(clamped % 7);

  let trimester: 1 | 2 | 3;
  if (weeks <= 13) {
    trimester = 1;
  } else if (weeks <= 27) {
    trimester = 2;
  } else {
    trimester = 3;
  }

  return { weeks, days, trimester, anomaly };
}

/**
 * Catégorise un pourcentage de graisse corporelle selon les seuils standard
 * de l'American Council on Exercise (ACE).
 *
 * Les catégories sont stables pour la plupart des adultes. Le paramètre age
 * est accepté pour le profil de l'utilisateur (tracabilité) ; un léger
 * ajustement de +0.5 % par décennie après 30 ans est appliqué pour tenir
 * compte de l'augmentation naturelle de la masse grasse avec l'âge
 * (Gallagher et al., 2000).
 */
export function getBodyFatCategory(
  bodyFatPercent: number,
  gender: "male" | "female",
  age: number,
): { category: string; message: string } {
  const ageAdjustment = Math.max(0, Math.ceil((age - 30) / 10)) * 0.5;

  if (gender === "female") {
    if (bodyFatPercent <= 13 + ageAdjustment) {
      return {
        category: "essentiel",
        message:
          "Votre taux de graisse corporelle correspond à la graisse essentielle, le minimum nécessaire pour la santé. Ce niveau est très bas et rare chez la population générale.",
      };
    }
    if (bodyFatPercent <= 20 + ageAdjustment) {
      return {
        category: "athletique",
        message:
          "Votre taux de graisse corporelle se situe dans la plage athlétique, typique des sportives régulières et des athlètes.",
      };
    }
    if (bodyFatPercent <= 24 + ageAdjustment) {
      return {
        category: "fitness",
        message:
          "Votre taux de graisse corporelle correspond à la catégorie fitness, considérée comme bonne pour la santé générale.",
      };
    }
    if (bodyFatPercent <= 31 + ageAdjustment) {
      return {
        category: "moyen",
        message:
          "Votre taux de graisse corporelle se situe dans la moyenne de la population. Maintenir de bonnes habitudes alimentaires et une activité physique régulière peut aider à rester dans cette zone.",
      };
    }
    return {
      category: "au_dessus_de_la_moyenne",
      message:
        "Votre taux de graisse corporelle est au-dessus de la moyenne recommandée. Une activité physique régulière et une alimentation équilibrée peuvent vous aider à atteindre un taux plus favorable pour la santé.",
    };
  }

  if (bodyFatPercent <= 5 + ageAdjustment) {
    return {
      category: "essentiel",
      message:
        "Votre taux de graisse corporelle correspond à la graisse essentielle, le minimum nécessaire pour la santé. Ce niveau est très bas et rare chez la population générale.",
    };
  }
  if (bodyFatPercent <= 13 + ageAdjustment) {
    return {
      category: "athletique",
      message:
        "Votre taux de graisse corporelle se situe dans la plage athlétique, typique des sportifs réguliers et des athlètes.",
    };
  }
  if (bodyFatPercent <= 17 + ageAdjustment) {
    return {
      category: "fitness",
      message:
        "Votre taux de graisse corporelle correspond à la catégorie fitness, considérée comme bonne pour la santé générale.",
    };
  }
  if (bodyFatPercent <= 24 + ageAdjustment) {
    return {
      category: "moyen",
      message:
        "Votre taux de graisse corporelle se situe dans la moyenne de la population. Maintenir de bonnes habitudes alimentaires et une activité physique régulière peut aider à rester dans cette zone.",
    };
  }
  return {
    category: "au_dessus_de_la_moyenne",
    message:
      "Votre taux de graisse corporelle est au-dessus de la moyenne recommandée. Une activité physique régulière et une alimentation équilibrée peuvent vous aider à atteindre un taux plus favorable pour la santé.",
  };
}
