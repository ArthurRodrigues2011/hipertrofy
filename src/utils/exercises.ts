import { MUSCLE_IDS, type Exercise, type ExerciseLibrary, type MuscleId } from "../types/training";

export const DEFAULT_EXERCISE_LIBRARY: ExerciseLibrary = {
  chest: [
    { id: "chest-1", name: "Supino reto" },
    { id: "chest-2", name: "Supino inclinado" },
    { id: "chest-3", name: "Crucifixo" },
  ],
  back: [
    { id: "back-1", name: "Puxada alta" },
    { id: "back-2", name: "Remada horizontal" },
    { id: "back-3", name: "Pulldown unilateral" },
  ],
  lateralDelt: [
    { id: "delt-1", name: "Elevacao lateral" },
    { id: "delt-2", name: "Elevacao lateral na polia" },
    { id: "delt-3", name: "Desenvolvimento com halteres" },
  ],
  biceps: [
    { id: "biceps-1", name: "Rosca direta" },
    { id: "biceps-2", name: "Rosca inclinada" },
    { id: "biceps-3", name: "Rosca martelo" },
  ],
  triceps: [
    { id: "triceps-1", name: "Triceps corda" },
    { id: "triceps-2", name: "Triceps testa" },
    { id: "triceps-3", name: "Paralela" },
  ],
  quads: [
    { id: "quads-1", name: "Agachamento" },
    { id: "quads-2", name: "Leg press" },
    { id: "quads-3", name: "Cadeira extensora" },
  ],
  hamstrings: [
    { id: "ham-1", name: "Mesa flexora" },
    { id: "ham-2", name: "Stiff" },
    { id: "ham-3", name: "Cadeira flexora" },
  ],
  calves: [
    { id: "calves-1", name: "Panturrilha em pe" },
    { id: "calves-2", name: "Panturrilha sentado" },
    { id: "calves-3", name: "Panturrilha no leg press" },
  ],
};

export function createExercise(name: string): Exercise {
  const fallbackId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : fallbackId;

  return {
    id,
    name: name.trim(),
  };
}

export function normalizeExerciseLibrary(
  library?: Partial<ExerciseLibrary> | null,
): ExerciseLibrary {
  return MUSCLE_IDS.reduce((normalized, muscleId: MuscleId) => {
    normalized[muscleId] =
      library?.[muscleId]?.length ? library[muscleId]! : DEFAULT_EXERCISE_LIBRARY[muscleId];
    return normalized;
  }, {} as ExerciseLibrary);
}
