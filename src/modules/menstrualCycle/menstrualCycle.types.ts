import type { Types } from "mongoose";

export type CycleFlow = "light" | "medium" | "heavy";

export type CycleSymptom =
  | "cramps"
  | "headache"
  | "fatigue"
  | "bloating"
  | "breast_tenderness"
  | "mood_swings"
  | "nausea"
  | "back_pain"
  | "acne"
  | "spotting"
  | "insomnia"
  | "dizziness";

export interface ICycleEntry {
  userId: Types.ObjectId;
  periodStartDate: Date;
  periodEndDate?: Date;
  flow?: CycleFlow;
  symptoms?: CycleSymptom[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
