import WeightGoal from "./weight.model.js";
import type { IWeightGoal } from "./weight.types.js";
import * as bmiService from "../bmi/bmi.service.js";
import type { IBmiEntry } from "../bmi/bmi.types.js";
import { ApiError } from "../../utils/ApiError.js";

export async function recordWeight(
  userId: string,
  data: { weight: number; height: number; recordedAt?: Date },
): Promise<IBmiEntry> {
  return bmiService.createEntry(userId, data);
}

export async function getWeightHistory(
  userId: string,
  options?: { limit?: number; from?: Date; to?: Date },
): Promise<IBmiEntry[]> {
  return bmiService.getHistory(userId, options);
}

export async function getCurrentWeight(
  userId: string,
): Promise<IBmiEntry | null> {
  return bmiService.getLatest(userId);
}

export async function setGoal(
  userId: string,
  data: { targetWeight: number; targetDate?: Date },
): Promise<IWeightGoal> {
  const latest = await getCurrentWeight(userId);

  if (!latest) {
    throw ApiError.badRequest(
      "Enregistrez au moins une pesée avant de définir un objectif",
    );
  }

  const goal = await WeightGoal.findOneAndUpdate(
    { userId },
    {
      $set: {
        targetWeight: data.targetWeight,
        targetDate: data.targetDate,
        startingWeight: latest.weight,
      },
    },
    { upsert: true, new: true },
  );

  return goal;
}

export async function getProgress(
  userId: string,
): Promise<{
  goal: IWeightGoal | null;
  currentWeight: number | null;
  startingWeight: number | null;
  weightChange: number | null;
  percentToGoal: number | null;
  message: string;
}> {
  const goal = await WeightGoal.findOne({ userId });
  const latest = await getCurrentWeight(userId);
  const currentWeight = latest?.weight ?? null;

  if (!goal) {
    return {
      goal: null,
      currentWeight,
      startingWeight: null,
      weightChange: null,
      percentToGoal: null,
      message: "Aucun objectif défini pour le moment",
    };
  }

  if (currentWeight === null) {
    return {
      goal,
      currentWeight: null,
      startingWeight: goal.startingWeight,
      weightChange: null,
      percentToGoal: null,
      message:
        "Enregistrez une pesée pour voir votre progression",
    };
  }

  const weightChange = currentWeight - goal.startingWeight;
  const totalDiff = Math.abs(goal.targetWeight - goal.startingWeight);

  let percentToGoal: number;
  let message: string;

  if (totalDiff === 0) {
    percentToGoal = 100;
    if (Math.abs(weightChange) < 0.1) {
      message = "Votre poids est stable et correspond à votre objectif.";
    } else {
      message = "Votre objectif est identique à votre poids de départ.";
    }
  } else if (goal.targetWeight > goal.startingWeight) {
    const gained = weightChange;
    const needed = goal.targetWeight - goal.startingWeight;

    if (gained >= needed) {
      percentToGoal = 100;
      message = `Félicitations ! Vous avez atteint votre objectif de prise de poids (${gained.toFixed(1)} kg).`;
    } else if (gained > 0) {
      percentToGoal = Math.min(100, Math.round((gained / needed) * 100));
      message = `Vous avez pris ${gained.toFixed(1)} kg sur les ${needed.toFixed(1)} kg visés (${percentToGoal}% de votre objectif).`;
    } else if (gained === 0) {
      percentToGoal = 0;
      message = "Votre poids est stable depuis le début de votre objectif.";
    } else {
      percentToGoal = 0;
      const lost = Math.abs(gained).toFixed(1);
      message = `Votre poids a diminué de ${lost} kg depuis le début de votre objectif.`;
    }
  } else {
    const lost = -weightChange;
    const needed = goal.startingWeight - goal.targetWeight;

    if (lost >= needed) {
      percentToGoal = 100;
      message = `Félicitations ! Vous avez atteint votre objectif de perte de poids (${lost.toFixed(1)} kg).`;
    } else if (lost > 0) {
      percentToGoal = Math.min(100, Math.round((lost / needed) * 100));
      message = `Vous avez perdu ${lost.toFixed(1)} kg sur les ${needed.toFixed(1)} kg visés (${percentToGoal}% de votre objectif).`;
    } else if (lost === 0) {
      percentToGoal = 0;
      message = "Votre poids est stable depuis le début de votre objectif.";
    } else {
      percentToGoal = 0;
      const gained = weightChange.toFixed(1);
      message = `Votre poids a augmenté de ${gained} kg depuis le début de votre objectif.`;
    }
  }

  return {
    goal,
    currentWeight,
    startingWeight: goal.startingWeight,
    weightChange,
    percentToGoal,
    message,
  };
}
