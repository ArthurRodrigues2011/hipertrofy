import type { WeeklyPlan } from "../types/training";

interface WeeklyPlanCardProps {
  weeklyPlan: WeeklyPlan;
}

export function WeeklyPlanCard({ weeklyPlan }: WeeklyPlanCardProps) {
  return (
    <section className="glass-card p-5">
      <div className="mb-4">
        <p className="eyebrow">Agenda</p>
        <h2 className="section-title">Distribuicao semanal</h2>
      </div>

      <div className="space-y-4">
        {weeklyPlan.days.map((day) => (
          <article key={day.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{day.dayName}</h3>
                <p className="text-sm text-teal-100">{day.splitName}</p>
                <p className="mt-1 text-xs text-slate-400">{day.focus}</p>
              </div>
              <span className="rounded-lg bg-white/10 px-3 py-1 text-sm font-bold text-white">
                {day.totalSets} series
              </span>
            </div>

            <div className="space-y-3">
              {day.muscles.map((muscle) => (
                <div key={`${day.id}-${muscle.muscleId}`} className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-100">{muscle.muscleName}</span>
                    <span className="text-sm text-slate-300">{muscle.sets} series</span>
                  </div>
                  {muscle.exercises.length > 0 && (
                    <div className="mt-2 grid gap-1 text-sm text-slate-400">
                      {muscle.exercises.map((exercise) => (
                        <div
                          key={`${day.id}-${muscle.muscleId}-${exercise.exerciseName}`}
                          className="flex justify-between gap-3"
                        >
                          <span className="truncate">{exercise.exerciseName}</span>
                          <span className="shrink-0">{exercise.sets} series</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
