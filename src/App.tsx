import { AlertsCard } from "./components/AlertsCard";
import { ExerciseLibraryPanel } from "./components/ExerciseLibraryPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { MuscleSliderPanel } from "./components/MuscleSliderPanel";
import { MuscleVolumeCard } from "./components/MuscleVolumeCard";
import { PresetsPanel } from "./components/PresetsPanel";
import { RadarChartPanel } from "./components/RadarChartPanel";
import { SnapshotPanel } from "./components/SnapshotPanel";
import { SummaryCard } from "./components/SummaryCard";
import { WeeklyPlanCard } from "./components/WeeklyPlanCard";
import { useTrainingPlanner } from "./hooks/useTrainingPlanner";

export default function App() {
  const planner = useTrainingPlanner();

  function handleSaveSnapshot() {
    const defaultName = `Plano ${new Date().toLocaleDateString("pt-BR")}`;
    const name = window.prompt("Nome do snapshot", defaultName);

    if (name !== null) {
      planner.saveSnapshot(name);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-app text-slate-100">
      <header className="mx-auto flex w-full max-w-[1760px] flex-col gap-5 px-4 pb-5 pt-6 sm:px-6 lg:px-8 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex rounded-lg border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-teal-100">
            Performance planner
          </div>
          <h1 className="text-3xl font-black tracking-normal text-white sm:text-5xl">
            Hypertrophy Radar Planner
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
            Ajuste o foco muscular, veja o radar atualizar em tempo real e receba uma divisao semanal
            com volume, alertas, snapshots e sugestoes de exercicios.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn-secondary" onClick={planner.resetPlan}>
            Resetar plano
          </button>
          <button type="button" className="btn-primary" onClick={handleSaveSnapshot}>
            Salvar snapshot
          </button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1760px] gap-5 px-4 pb-8 sm:px-6 lg:px-8 xl:grid-cols-[340px_minmax(440px,1fr)_420px]">
        <aside className="space-y-5">
          <MuscleSliderPanel
            levels={planner.config.levels}
            volume={planner.weeklyVolume}
            trainingDays={planner.config.trainingDays}
            keepBalanced={planner.config.keepBalanced}
            onLevelChange={planner.setMuscleLevel}
            onTrainingDaysChange={planner.setTrainingDays}
            onKeepBalancedChange={planner.setKeepBalanced}
          />
          <PresetsPanel onApplyPreset={planner.applyPreset} />
        </aside>

        <section className="space-y-5">
          <RadarChartPanel
            data={planner.radarData}
            totalWeeklyVolume={planner.totalWeeklyVolume}
            splitName={planner.weeklyPlan.splitName}
          />
          <SummaryCard
            config={planner.config}
            volume={planner.weeklyVolume}
            totalWeeklyVolume={planner.totalWeeklyVolume}
            priorityMuscles={planner.priorityMuscles}
            maintenanceMuscles={planner.maintenanceMuscles}
            splitName={planner.weeklyPlan.splitName}
          />
        </section>

        <aside className="space-y-5">
          <MuscleVolumeCard levels={planner.config.levels} volume={planner.weeklyVolume} />
          <AlertsCard alerts={planner.alerts} />
          <WeeklyPlanCard weeklyPlan={planner.weeklyPlan} />
          <SnapshotPanel
            snapshots={planner.snapshots}
            onSave={handleSaveSnapshot}
            onLoad={planner.loadSnapshot}
            onDelete={planner.deleteSnapshot}
          />
          <HistoryPanel history={planner.history} onClear={planner.clearHistory} />
        </aside>

        <div className="xl:col-span-3">
          <ExerciseLibraryPanel
            exerciseLibrary={planner.exerciseLibrary}
            onAddExercise={planner.addExercise}
            onRemoveExercise={planner.removeExercise}
          />
        </div>
      </main>
    </div>
  );
}
