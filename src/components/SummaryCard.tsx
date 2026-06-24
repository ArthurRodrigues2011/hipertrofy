import {
  MUSCLE_DEFINITIONS,
  type MuscleId,
  type PlannerConfig,
  type WeeklyVolumeMap,
} from "../types/training";

interface SummaryCardProps {
  config: PlannerConfig;
  volume: WeeklyVolumeMap;
  totalWeeklyVolume: number;
  priorityMuscles: MuscleId[];
  maintenanceMuscles: MuscleId[];
  splitName: string;
}

function muscleList(muscles: MuscleId[], fallback: string) {
  if (!muscles.length) {
    return <span className="text-slate-400">{fallback}</span>;
  }

  return muscles.map((muscleId) => (
    <span key={muscleId} className="badge">
      {MUSCLE_DEFINITIONS[muscleId].label}
    </span>
  ));
}

export function SummaryCard({
  config,
  volume,
  totalWeeklyVolume,
  priorityMuscles,
  maintenanceMuscles,
  splitName,
}: SummaryCardProps) {
  return (
    <section className="glass-card p-5">
      <div className="mb-5">
        <p className="eyebrow">Resumo</p>
        <h2 className="section-title">Plano atual</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="metric-tile">
          <span>Volume total</span>
          <strong>{totalWeeklyVolume}</strong>
          <small>series semanais</small>
        </div>
        <div className="metric-tile">
          <span>Dias</span>
          <strong>{config.trainingDays}</strong>
          <small>treinos por semana</small>
        </div>
        <div className="metric-tile">
          <span>Divisao</span>
          <strong className="text-lg">{splitName}</strong>
          <small>gerada automaticamente</small>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-200">Musculos prioritarios</p>
          <div className="flex flex-wrap gap-2">{muscleList(priorityMuscles, "Nenhum acima de nivel 8.")}</div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-200">Musculos em manutencao</p>
          <div className="flex flex-wrap gap-2">{muscleList(maintenanceMuscles, "Nenhum em manutencao.")}</div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(volume).map(([muscleId, sets]) => (
          <div key={muscleId} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="truncate text-xs text-slate-400">
              {MUSCLE_DEFINITIONS[muscleId as MuscleId].label}
            </p>
            <p className="text-lg font-black text-white">{sets} series</p>
          </div>
        ))}
      </div>
    </section>
  );
}
