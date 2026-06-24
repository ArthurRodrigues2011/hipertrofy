import {
  MUSCLE_DEFINITIONS,
  MUSCLE_IDS,
  type DailyPlan,
  type ExerciseLibrary,
  type ExercisePlanItem,
  type MuscleId,
  type TrainingDays,
  type WeeklyPlan,
  type WeeklyVolumeMap,
} from "../types/training";

const MAX_SETS_PER_MUSCLE_SESSION = 10;
const DAY_NAMES_BY_COUNT: Record<TrainingDays, string[]> = {
  3: ["Segunda", "Quarta", "Sexta"],
  4: ["Segunda", "Terca", "Quinta", "Sexta"],
  5: ["Segunda", "Terca", "Quarta", "Quinta", "Sexta"],
  6: ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"],
};

interface DayTemplate {
  splitName: string;
  focus: string;
  allowedMuscles: MuscleId[];
}

const upperMuscles: MuscleId[] = ["chest", "back", "lateralDelt", "biceps", "triceps"];
const pushMuscles: MuscleId[] = ["chest", "lateralDelt", "triceps"];
const pullMuscles: MuscleId[] = ["back", "biceps"];
const legMuscles: MuscleId[] = ["quads", "hamstrings", "calves"];
const allMuscles = [...MUSCLE_IDS];

const TEMPLATES: Record<TrainingDays, { splitName: string; days: DayTemplate[] }> = {
  3: {
    splitName: "Full Body adaptado",
    days: [
      {
        splitName: "Full Body A",
        focus: "Base pesada de superiores e quadriceps",
        allowedMuscles: allMuscles,
      },
      {
        splitName: "Full Body B",
        focus: "Costas, posterior e bracos",
        allowedMuscles: allMuscles,
      },
      {
        splitName: "Full Body C",
        focus: "Peito, ombros e pernas completas",
        allowedMuscles: allMuscles,
      },
    ],
  },
  4: {
    splitName: "Upper/Lower",
    days: [
      { splitName: "Upper A", focus: "Peito, costas e ombro", allowedMuscles: upperMuscles },
      { splitName: "Lower A", focus: "Quadriceps e posterior", allowedMuscles: legMuscles },
      { splitName: "Upper B", focus: "Costas, peito e bracos", allowedMuscles: upperMuscles },
      {
        splitName: "Lower B + bracos",
        focus: "Pernas com suporte de bracos",
        allowedMuscles: [...legMuscles, "biceps", "triceps"],
      },
    ],
  },
  5: {
    splitName: "Push/Pull/Legs adaptado",
    days: [
      { splitName: "Push", focus: "Peito, ombro lateral e triceps", allowedMuscles: pushMuscles },
      { splitName: "Pull", focus: "Costas e biceps", allowedMuscles: pullMuscles },
      { splitName: "Legs", focus: "Pernas completas", allowedMuscles: legMuscles },
      {
        splitName: "Upper foco",
        focus: "Musculos superiores priorizados",
        allowedMuscles: upperMuscles,
      },
      {
        splitName: "Lower + arms",
        focus: "Pernas e acabamento de bracos",
        allowedMuscles: [...legMuscles, "biceps", "triceps"],
      },
    ],
  },
  6: {
    splitName: "Push/Pull/Legs 2x",
    days: [
      { splitName: "Push A", focus: "Peito e triceps", allowedMuscles: pushMuscles },
      { splitName: "Pull A", focus: "Costas e biceps", allowedMuscles: pullMuscles },
      { splitName: "Legs A", focus: "Quadriceps dominante", allowedMuscles: legMuscles },
      { splitName: "Push B", focus: "Ombro lateral e peito", allowedMuscles: pushMuscles },
      { splitName: "Pull B", focus: "Costas e bracos", allowedMuscles: pullMuscles },
      { splitName: "Legs B", focus: "Posterior e panturrilha", allowedMuscles: legMuscles },
    ],
  },
};

export function distributeExercisesForMuscle(
  muscleId: MuscleId,
  sets: number,
  exerciseLibrary: ExerciseLibrary,
): ExercisePlanItem[] {
  const exercises = exerciseLibrary[muscleId] ?? [];
  if (!exercises.length || sets <= 0) {
    return [];
  }

  const exerciseCount = Math.min(exercises.length, sets >= 9 ? 3 : sets >= 5 ? 2 : 1);
  const selected = exercises.slice(0, exerciseCount);
  const baseSets = Math.floor(sets / exerciseCount);
  const remainder = sets % exerciseCount;

  return selected.map((exercise, index) => ({
    exerciseName: exercise.name,
    sets: baseSets + (index < remainder ? 1 : 0),
  }));
}

function getTargetFrequency(sets: number, trainingDays: TrainingDays): number {
  const volumeFrequency = sets >= 21 ? 3 : sets >= 14 ? 2 : 1;
  const sessionCapFrequency = Math.ceil(sets / MAX_SETS_PER_MUSCLE_SESSION);
  return Math.min(trainingDays, Math.max(volumeFrequency, sessionCapFrequency));
}

function splitSetsAcrossSessions(totalSets: number, sessions: number): number[] {
  const baseSets = Math.floor(totalSets / sessions);
  const remainder = totalSets % sessions;

  return Array.from({ length: sessions }, (_, index) => baseSets + (index < remainder ? 1 : 0));
}

function chooseDaysForMuscle(
  muscleId: MuscleId,
  frequency: number,
  templates: DayTemplate[],
  currentDayTotals: number[],
): number[] {
  const preferredDayIndexes = templates
    .map((template, index) => (template.allowedMuscles.includes(muscleId) ? index : -1))
    .filter((index) => index >= 0);

  const candidates = [...preferredDayIndexes];
  templates.forEach((_, index) => {
    if (candidates.length < frequency && !candidates.includes(index)) {
      candidates.push(index);
    }
  });

  const selected: number[] = [];
  while (selected.length < frequency) {
    const available = candidates.filter((index) => !selected.includes(index));
    const bestDay =
      available.sort((a, b) => {
      const adjacencyPenaltyA = selected.some((day) => Math.abs(day - a) === 1) ? 3 : 0;
      const adjacencyPenaltyB = selected.some((day) => Math.abs(day - b) === 1) ? 3 : 0;
      const preferredBonusA = preferredDayIndexes.includes(a) ? -2 : 0;
      const preferredBonusB = preferredDayIndexes.includes(b) ? -2 : 0;

      return (
        currentDayTotals[a] +
        adjacencyPenaltyA +
        preferredBonusA -
        (currentDayTotals[b] + adjacencyPenaltyB + preferredBonusB) ||
        a - b
      );
    })[0] ?? 0;

    selected.push(bestDay);
  }

  return selected.sort((a, b) => a - b);
}

export function generateWeeklyPlan(
  volume: WeeklyVolumeMap,
  trainingDays: TrainingDays,
  exerciseLibrary: ExerciseLibrary,
): WeeklyPlan {
  const template = TEMPLATES[trainingDays];
  const dayNames = DAY_NAMES_BY_COUNT[trainingDays];
  const currentDayTotals = Array.from({ length: trainingDays }, () => 0);
  const days: DailyPlan[] = template.days.map((dayTemplate, index) => ({
    id: `${index}-${dayNames[index]}`,
    dayName: dayNames[index],
    splitName: dayTemplate.splitName,
    focus: dayTemplate.focus,
    muscles: [],
    totalSets: 0,
  }));

  const musclesByPriority = [...MUSCLE_IDS].sort((a, b) => volume[b] - volume[a]);

  musclesByPriority.forEach((muscleId) => {
    const totalMuscleSets = volume[muscleId];
    const frequency = getTargetFrequency(totalMuscleSets, trainingDays);
    const selectedDays = chooseDaysForMuscle(
      muscleId,
      frequency,
      template.days,
      currentDayTotals,
    );
    const setDistribution = splitSetsAcrossSessions(totalMuscleSets, selectedDays.length);

    selectedDays.forEach((dayIndex, distributionIndex) => {
      const sets = setDistribution[distributionIndex];
      currentDayTotals[dayIndex] += sets;
      days[dayIndex].muscles.push({
        muscleId,
        muscleName: MUSCLE_DEFINITIONS[muscleId].label,
        sets,
        exercises: distributeExercisesForMuscle(muscleId, sets, exerciseLibrary),
      });
    });
  });

  const normalizedDays = days.map((day) => ({
    ...day,
    muscles: day.muscles.sort((a, b) => b.sets - a.sets),
    totalSets: day.muscles.reduce((sum, muscle) => sum + muscle.sets, 0),
  }));

  return {
    splitName: template.splitName,
    trainingDays,
    totalSets: normalizedDays.reduce((sum, day) => sum + day.totalSets, 0),
    days: normalizedDays,
  };
}
