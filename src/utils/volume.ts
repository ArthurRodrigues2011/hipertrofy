import {
  MUSCLE_DEFINITIONS,
  MUSCLE_IDS,
  type MuscleId,
  type MuscleLevelMap,
  type RadarDatum,
  type WeeklyVolumeMap,
} from "../types/training";

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 10;

export const LEVEL_TO_WEEKLY_SETS: Record<number, number> = {
  1: 6,
  2: 8,
  3: 10,
  4: 12,
  5: 14,
  6: 16,
  7: 18,
  8: 20,
  9: 22,
  10: 24,
};

export function clampLevel(value: number): number {
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(value)));
}

export function levelToWeeklySets(level: number): number {
  return LEVEL_TO_WEEKLY_SETS[clampLevel(level)];
}

export function levelsToWeeklyVolume(levels: MuscleLevelMap): WeeklyVolumeMap {
  return MUSCLE_IDS.reduce((volume, muscleId) => {
    volume[muscleId] = levelToWeeklySets(levels[muscleId]);
    return volume;
  }, {} as WeeklyVolumeMap);
}

export function getTotalWeeklyVolume(volume: WeeklyVolumeMap): number {
  return MUSCLE_IDS.reduce((sum, muscleId) => sum + volume[muscleId], 0);
}

export function createRadarData(
  levels: MuscleLevelMap,
  volume: WeeklyVolumeMap,
): RadarDatum[] {
  return MUSCLE_IDS.map((muscleId) => ({
    muscle: MUSCLE_DEFINITIONS[muscleId].shortLabel,
    nivel: levels[muscleId],
    series: volume[muscleId],
    fullMark: MAX_LEVEL,
  }));
}

export function getPriorityMuscles(levels: MuscleLevelMap): MuscleId[] {
  return MUSCLE_IDS.filter((muscleId) => levels[muscleId] >= 8);
}

export function getMaintenanceMuscles(levels: MuscleLevelMap): MuscleId[] {
  return MUSCLE_IDS.filter((muscleId) => levels[muscleId] <= 5);
}

export function rebalanceLevelsOnChange(
  currentLevels: MuscleLevelMap,
  targetMuscle: MuscleId,
  nextLevel: number,
): MuscleLevelMap {
  const targetLevel = clampLevel(nextLevel);
  const previousTargetLevel = currentLevels[targetMuscle];
  const result: MuscleLevelMap = {
    ...currentLevels,
    [targetMuscle]: targetLevel,
  };

  const increase = targetLevel - previousTargetLevel;
  if (increase <= 0) {
    return result;
  }

  // Mantem o aumento previsivel: cada ponto extra no foco principal tenta
  // retirar 75% de um ponto dos demais, proporcionalmente ao quanto ainda
  // podem descer sem furar o nivel minimo.
  const requestedReduction = Math.ceil(increase * 0.75);
  const candidates = MUSCLE_IDS.filter(
    (muscleId) => muscleId !== targetMuscle && result[muscleId] > MIN_LEVEL,
  );
  const totalCapacity = candidates.reduce(
    (sum, muscleId) => sum + (result[muscleId] - MIN_LEVEL),
    0,
  );

  if (totalCapacity <= 0) {
    return result;
  }

  const reductionBudget = Math.min(requestedReduction, totalCapacity);
  const plannedReductions = candidates.map((muscleId) => {
    const capacity = result[muscleId] - MIN_LEVEL;
    const exactReduction = (capacity / totalCapacity) * reductionBudget;
    return {
      muscleId,
      capacity,
      amount: Math.floor(exactReduction),
      remainder: exactReduction % 1,
    };
  });

  let usedReduction = plannedReductions.reduce((sum, item) => sum + item.amount, 0);
  plannedReductions
    .sort(
      (a, b) =>
        b.remainder - a.remainder ||
        b.capacity - a.capacity ||
        MUSCLE_IDS.indexOf(a.muscleId) - MUSCLE_IDS.indexOf(b.muscleId),
    )
    .forEach((item) => {
      if (usedReduction >= reductionBudget || item.amount >= item.capacity) {
        return;
      }

      item.amount += 1;
      usedReduction += 1;
    });

  plannedReductions.forEach(({ muscleId, amount }) => {
    result[muscleId] = clampLevel(result[muscleId] - amount);
  });

  return result;
}
