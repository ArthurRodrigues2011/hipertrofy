import type {
  ExerciseLibrary,
  PlanChange,
  PlannerConfig,
  PlanSnapshot,
} from "../types/training";

const CONFIG_KEY = "hypertrophy-radar:config";
const SNAPSHOTS_KEY = "hypertrophy-radar:snapshots";
const EXERCISES_KEY = "hypertrophy-radar:exercises";
const HISTORY_KEY = "hypertrophy-radar:history";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function loadJson<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function saveJson<T>(key: string, value: T): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export const loadConfig = () => loadJson<PlannerConfig>(CONFIG_KEY);
export const saveConfig = (config: PlannerConfig) => saveJson(CONFIG_KEY, config);

export const loadSnapshots = () => loadJson<PlanSnapshot[]>(SNAPSHOTS_KEY);
export const saveSnapshots = (snapshots: PlanSnapshot[]) => saveJson(SNAPSHOTS_KEY, snapshots);

export const loadExerciseLibrary = () => loadJson<ExerciseLibrary>(EXERCISES_KEY);
export const saveExerciseLibrary = (library: ExerciseLibrary) => saveJson(EXERCISES_KEY, library);

export const loadHistory = () => loadJson<PlanChange[]>(HISTORY_KEY);
export const saveHistory = (history: PlanChange[]) => saveJson(HISTORY_KEY, history);
