import { Types } from "mongoose";
import CycleEntry from "./menstrualCycle.model.js";
import type { ICycleEntry, CycleFlow, CycleSymptom } from "./menstrualCycle.types.js";
import { calculateCycleLength, predictNextPeriod as predictNextPeriodUtil, predictFertileWindow as predictFertileWindowUtil } from "../../utils/healthFormulas.js";
import { ApiError } from "../../utils/ApiError.js";

export async function createEntry(
  userId: string,
  data: {
    periodStartDate: Date;
    periodEndDate?: Date;
    flow?: CycleFlow;
    symptoms?: CycleSymptom[];
    notes?: string;
  },
): Promise<ICycleEntry> {
  try {
    const entry = await CycleEntry.create({
      userId: new Types.ObjectId(userId),
      periodStartDate: data.periodStartDate,
      periodEndDate: data.periodEndDate,
      flow: data.flow,
      symptoms: data.symptoms,
      notes: data.notes,
    });

    return entry.toObject();
  } catch (err: unknown) {
    if ((err as Record<string, unknown>)?.code === 11000) {
      throw ApiError.conflict("A cycle entry already exists for this date");
    }
    throw err;
  }
}

export async function getHistory(
  userId: string,
  options?: {
    limit?: number;
    fromDate?: Date;
    toDate?: Date;
  },
): Promise<ICycleEntry[]> {
  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };

  if (options?.fromDate || options?.toDate) {
    const dateFilter: Record<string, Date> = {};
    if (options.fromDate) dateFilter.$gte = options.fromDate;
    if (options.toDate) dateFilter.$lte = options.toDate;
    filter.periodStartDate = dateFilter;
  }

  let query = CycleEntry.find(filter).sort({ periodStartDate: -1 });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query.lean();
}

export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  const entry = await CycleEntry.findById(entryId);

  if (!entry) {
    throw ApiError.notFound("Cycle entry not found");
  }

  if (entry.userId.toString() !== userId) {
    throw ApiError.forbidden("You cannot delete a cycle entry that does not belong to you");
  }

  await CycleEntry.findByIdAndDelete(entryId);
}

export async function getCycleStats(
  userId: string,
): Promise<{
  averageLength: number | null;
  isRegular: boolean;
  confidenceLevel: string;
  cyclesAnalyzed: number;
}> {
  const entries = await CycleEntry.find(
    { userId: new Types.ObjectId(userId) },
  )
    .sort({ periodStartDate: 1 })
    .select("periodStartDate")
    .lean();

  if (entries.length < 2) {
    return {
      averageLength: null,
      isRegular: false,
      confidenceLevel: "low",
      cyclesAnalyzed: 0,
    };
  }

  const startDates = entries.map((e) => e.periodStartDate);
  const result = calculateCycleLength(startDates);

  return {
    averageLength: result.averageLength,
    isRegular: result.isRegular,
    confidenceLevel: result.confidenceLevel,
    cyclesAnalyzed: startDates.length - 1,
  };
}

export async function predictNextPeriod(
  userId: string,
): Promise<
  | {
      estimatedDate: Date;
      rangeStart: Date;
      rangeEnd: Date;
      confidenceLevel: string;
      basedOnCyclesCount: number;
    }
  | { error: string }
> {
  const stats = await getCycleStats(userId);

  if (stats.averageLength === null) {
    return {
      error:
        "Pas assez de données pour estimer votre cycle, continuez à enregistrer vos prochaines règles",
    };
  }

  const entries = await CycleEntry.find(
    { userId: new Types.ObjectId(userId) },
  )
    .sort({ periodStartDate: -1 })
    .limit(1)
    .select("periodStartDate")
    .lean();

  if (entries.length === 0) {
    return { error: "Aucune période enregistrée" };
  }

  const { estimatedDate, rangeStart, rangeEnd } = predictNextPeriodUtil(
    entries[0].periodStartDate,
    stats.averageLength,
    stats.confidenceLevel as "low" | "medium" | "high",
  );

  return {
    estimatedDate,
    rangeStart,
    rangeEnd,
    confidenceLevel: stats.confidenceLevel,
    basedOnCyclesCount: stats.cyclesAnalyzed,
  };
}

export async function predictFertileWindowFn(
  userId: string,
): Promise<
  | {
      estimatedOvulationDate: Date;
      fertileWindowStart: Date;
      fertileWindowEnd: Date;
      confidenceLevel: string;
      basedOnCyclesCount: number;
      disclaimer: string;
    }
  | { error: string }
> {
  const stats = await getCycleStats(userId);

  if (stats.averageLength === null) {
    return {
      error:
        "Pas assez de données pour estimer votre fenêtre de fertilité, continuez à enregistrer vos prochaines règles",
    };
  }

  const entries = await CycleEntry.find(
    { userId: new Types.ObjectId(userId) },
  )
    .sort({ periodStartDate: -1 })
    .limit(1)
    .select("periodStartDate")
    .lean();

  if (entries.length === 0) {
    return { error: "Aucune période enregistrée" };
  }

  const result = predictFertileWindowUtil(
    entries[0].periodStartDate,
    stats.averageLength,
    stats.confidenceLevel as "low" | "medium" | "high",
  );

  return {
    estimatedOvulationDate: result.estimatedOvulationDate,
    fertileWindowStart: result.fertileWindowStart,
    fertileWindowEnd: result.fertileWindowEnd,
    confidenceLevel: result.confidenceLevel,
    basedOnCyclesCount: stats.cyclesAnalyzed,
    disclaimer: result.disclaimer,
  };
}
