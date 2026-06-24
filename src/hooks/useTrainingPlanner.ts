import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MUSCLE_DEFINITIONS,
  type ExerciseLibrary,
  type MuscleId,
  type PlanChange,
  type PlanSnapshot,
  type TrainingDays,
} from "../types/training";
import { generatePlanAlerts } from "../utils/alerts";
import { generateWeeklyPlan } from "../utils/distribution";
import { createExercise, normalizeExerciseLibrary } from "../utils/exercises";
import { DEFAULT_CONFIG, PRESETS } from "../utils/presets";
import {
  loadConfig,
  loadExerciseLibrary,
  loadHistory,
  loadSnapshots,
  saveConfig,
  saveExerciseLibrary,
  saveHistory,
  saveSnapshots,
} from "../utils/storage";
import {
  clampLevel,
  createRadarData,
  getMaintenanceMuscles,
  getPriorityMuscles,
  getTotalWeeklyVolume,
  levelsToWeeklyVolume,
  rebalanceLevelsOnChange,
} from "../utils/volume";

const MAX_HISTORY_ITEMS = 24;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneDefaultConfig() {
  return {
    ...DEFAULT_CONFIG,
    levels: { ...DEFAULT_CONFIG.levels },
  };
}

export function useTrainingPlanner() {
  const [config, setConfig] = useState(() => loadConfig() ?? cloneDefaultConfig());
  const [snapshots, setSnapshots] = useState<PlanSnapshot[]>(() => loadSnapshots() ?? []);
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseLibrary>(() =>
    normalizeExerciseLibrary(loadExerciseLibrary()),
  );
  const [history, setHistory] = useState<PlanChange[]>(() => loadHistory() ?? []);

  useEffect(() => saveConfig(config), [config]);
  useEffect(() => saveSnapshots(snapshots), [snapshots]);
  useEffect(() => saveExerciseLibrary(exerciseLibrary), [exerciseLibrary]);
  useEffect(() => saveHistory(history), [history]);

  const weeklyVolume = useMemo(() => levelsToWeeklyVolume(config.levels), [config.levels]);
  const totalWeeklyVolume = useMemo(() => getTotalWeeklyVolume(weeklyVolume), [weeklyVolume]);
  const weeklyPlan = useMemo(
    () => generateWeeklyPlan(weeklyVolume, config.trainingDays, exerciseLibrary),
    [weeklyVolume, config.trainingDays, exerciseLibrary],
  );
  const alerts = useMemo(
    () => generatePlanAlerts(weeklyVolume, config, weeklyPlan),
    [weeklyVolume, config, weeklyPlan],
  );
  const radarData = useMemo(
    () => createRadarData(config.levels, weeklyVolume),
    [config.levels, weeklyVolume],
  );
  const priorityMuscles = useMemo(() => getPriorityMuscles(config.levels), [config.levels]);
  const maintenanceMuscles = useMemo(
    () => getMaintenanceMuscles(config.levels),
    [config.levels],
  );

  const addHistory = useCallback((title: string, detail: string) => {
    const change: PlanChange = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      title,
      detail,
    };

    setHistory((current) => [change, ...current].slice(0, MAX_HISTORY_ITEMS));
  }, []);

  const setMuscleLevel = useCallback(
    (muscleId: MuscleId, nextValue: number) => {
      const nextLevel = clampLevel(nextValue);
      const currentLevel = config.levels[muscleId];

      if (currentLevel === nextLevel) {
        return;
      }

      const levels = config.keepBalanced
        ? rebalanceLevelsOnChange(config.levels, muscleId, nextLevel)
        : { ...config.levels, [muscleId]: nextLevel };

      setConfig((current) => ({
        ...current,
        levels,
      }));
      addHistory(
        `${MUSCLE_DEFINITIONS[muscleId].label} ajustado`,
        `Nivel ${currentLevel} -> ${nextLevel}${
          config.keepBalanced ? " com redistribuicao equilibrada ativa." : "."
        }`,
      );
    },
    [addHistory, config.keepBalanced, config.levels],
  );

  const setTrainingDays = useCallback(
    (trainingDays: TrainingDays) => {
      if (config.trainingDays === trainingDays) {
        return;
      }

      setConfig((current) => ({ ...current, trainingDays }));
      addHistory("Dias de treino alterados", `${config.trainingDays} -> ${trainingDays} dias.`);
    },
    [addHistory, config.trainingDays],
  );

  const setKeepBalanced = useCallback(
    (keepBalanced: boolean) => {
      if (config.keepBalanced === keepBalanced) {
        return;
      }

      setConfig((current) => ({ ...current, keepBalanced }));
      addHistory(
        "Modo equilibrado alterado",
        keepBalanced ? "Redistribuicao automatica ligada." : "Redistribuicao automatica desligada.",
      );
    },
    [addHistory, config.keepBalanced],
  );

  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = PRESETS.find((item) => item.id === presetId);
      if (!preset) {
        return;
      }

      setConfig((current) => ({
        levels: { ...preset.levels },
        trainingDays: preset.trainingDays ?? current.trainingDays,
        keepBalanced: preset.keepBalanced ?? current.keepBalanced,
      }));
      addHistory("Preset aplicado", preset.name);
    },
    [addHistory],
  );

  const resetPlan = useCallback(() => {
    setConfig(cloneDefaultConfig());
    addHistory("Plano resetado", "Configuracao inicial restaurada.");
  }, [addHistory]);

  const saveSnapshot = useCallback(
    (name?: string) => {
      const snapshotName =
        name?.trim() ||
        `Plano ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString(
          "pt-BR",
          { hour: "2-digit", minute: "2-digit" },
        )}`;
      const snapshot: PlanSnapshot = {
        id: makeId(),
        name: snapshotName,
        createdAt: new Date().toISOString(),
        config: {
          ...config,
          levels: { ...config.levels },
        },
      };

      setSnapshots((current) => [snapshot, ...current]);
      addHistory("Snapshot salvo", snapshotName);
      return snapshot;
    },
    [addHistory, config],
  );

  const loadSnapshot = useCallback(
    (snapshotId: string) => {
      const snapshot = snapshots.find((item) => item.id === snapshotId);
      if (!snapshot) {
        return;
      }

      setConfig({
        ...snapshot.config,
        levels: { ...snapshot.config.levels },
      });
      addHistory("Snapshot carregado", snapshot.name);
    },
    [addHistory, snapshots],
  );

  const deleteSnapshot = useCallback(
    (snapshotId: string) => {
      const snapshot = snapshots.find((item) => item.id === snapshotId);
      setSnapshots((current) => current.filter((item) => item.id !== snapshotId));

      if (snapshot) {
        addHistory("Snapshot excluido", snapshot.name);
      }
    },
    [addHistory, snapshots],
  );

  const addExercise = useCallback(
    (muscleId: MuscleId, name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return;
      }

      const exercise = createExercise(trimmedName);
      setExerciseLibrary((current) => ({
        ...current,
        [muscleId]: [...current[muscleId], exercise],
      }));
      addHistory("Exercicio cadastrado", `${trimmedName} em ${MUSCLE_DEFINITIONS[muscleId].label}.`);
    },
    [addHistory],
  );

  const removeExercise = useCallback(
    (muscleId: MuscleId, exerciseId: string) => {
      const exercise = exerciseLibrary[muscleId].find((item) => item.id === exerciseId);
      setExerciseLibrary((current) => ({
        ...current,
        [muscleId]: current[muscleId].filter((item) => item.id !== exerciseId),
      }));

      if (exercise) {
        addHistory("Exercicio removido", `${exercise.name} saiu de ${MUSCLE_DEFINITIONS[muscleId].label}.`);
      }
    },
    [addHistory, exerciseLibrary],
  );

  const clearHistory = useCallback(() => setHistory([]), []);

  return {
    config,
    weeklyVolume,
    totalWeeklyVolume,
    weeklyPlan,
    alerts,
    radarData,
    priorityMuscles,
    maintenanceMuscles,
    snapshots,
    exerciseLibrary,
    history,
    setMuscleLevel,
    setTrainingDays,
    setKeepBalanced,
    applyPreset,
    resetPlan,
    saveSnapshot,
    loadSnapshot,
    deleteSnapshot,
    addExercise,
    removeExercise,
    clearHistory,
  };
}
