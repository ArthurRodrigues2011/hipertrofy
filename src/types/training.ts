export const MUSCLE_IDS = [
  "chest",
  "back",
  "lateralDelt",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "calves",
] as const;

export type MuscleId = (typeof MUSCLE_IDS)[number];
export type TrainingDays = 3 | 4 | 5 | 6;
export type MuscleGroup = "push" | "pull" | "legs" | "arms";
export type MuscleLevelMap = Record<MuscleId, number>;
export type WeeklyVolumeMap = Record<MuscleId, number>;

export interface MuscleDefinition {
  id: MuscleId;
  label: string;
  shortLabel: string;
  group: MuscleGroup;
  color: string;
}

export const MUSCLE_DEFINITIONS: Record<MuscleId, MuscleDefinition> = {
  chest: {
    id: "chest",
    label: "Peito",
    shortLabel: "Peito",
    group: "push",
    color: "#22d3ee",
  },
  back: {
    id: "back",
    label: "Costas",
    shortLabel: "Costas",
    group: "pull",
    color: "#2dd4bf",
  },
  lateralDelt: {
    id: "lateralDelt",
    label: "Ombro lateral",
    shortLabel: "Ombro",
    group: "push",
    color: "#a78bfa",
  },
  biceps: {
    id: "biceps",
    label: "Bíceps",
    shortLabel: "Bíceps",
    group: "arms",
    color: "#60a5fa",
  },
  triceps: {
    id: "triceps",
    label: "Tríceps",
    shortLabel: "Tríceps",
    group: "arms",
    color: "#f472b6",
  },
  quads: {
    id: "quads",
    label: "Quadríceps",
    shortLabel: "Quads",
    group: "legs",
    color: "#facc15",
  },
  hamstrings: {
    id: "hamstrings",
    label: "Posterior de coxa",
    shortLabel: "Posterior",
    group: "legs",
    color: "#fb923c",
  },
  calves: {
    id: "calves",
    label: "Panturrilha",
    shortLabel: "Panturrilha",
    group: "legs",
    color: "#4ade80",
  },
};

export const MUSCLES = MUSCLE_IDS.map((id) => MUSCLE_DEFINITIONS[id]);

export interface PlannerConfig {
  levels: MuscleLevelMap;
  trainingDays: TrainingDays;
  keepBalanced: boolean;
}

export interface RadarDatum {
  muscle: string;
  nivel: number;
  series: number;
  fullMark: number;
}

export interface Exercise {
  id: string;
  name: string;
}

export type ExerciseLibrary = Record<MuscleId, Exercise[]>;

export interface ExercisePlanItem {
  exerciseName: string;
  sets: number;
}

export interface DailyMusclePlan {
  muscleId: MuscleId;
  muscleName: string;
  sets: number;
  exercises: ExercisePlanItem[];
}

export interface DailyPlan {
  id: string;
  dayName: string;
  splitName: string;
  focus: string;
  muscles: DailyMusclePlan[];
  totalSets: number;
}

export interface WeeklyPlan {
  splitName: string;
  trainingDays: TrainingDays;
  totalSets: number;
  days: DailyPlan[];
}

export type AlertSeverity = "info" | "warning" | "danger";

export interface PlanAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  levels: MuscleLevelMap;
  trainingDays?: TrainingDays;
  keepBalanced?: boolean;
}

export interface PlanSnapshot {
  id: string;
  name: string;
  createdAt: string;
  config: PlannerConfig;
}

export interface PlanChange {
  id: string;
  createdAt: string;
  title: string;
  detail: string;
}
