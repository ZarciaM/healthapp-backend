export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
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
