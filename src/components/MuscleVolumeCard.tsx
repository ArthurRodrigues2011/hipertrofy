import {
  MUSCLE_DEFINITIONS,
  MUSCLE_IDS,
  type MuscleLevelMap,
  type WeeklyVolumeMap,
} from "../types/training";

interface MuscleVolumeCardProps {
  levels: MuscleLevelMap;
  volume: WeeklyVolumeMap;
}

export function MuscleVolumeCard({ levels, volume }: MuscleVolumeCardProps) {
  const rows = [...MUSCLE_IDS].sort((a, b) => volume[b] - volume[a]);

  return (
    <section className="glass-card p-5">
      <div className="mb-4">
        <p className="eyebrow">Volume</p>
        <h2 className="section-title">Series por musculo</h2>
      </div>

      <div className="space-y-3">
        {rows.map((muscleId) => {
          const muscle = MUSCLE_DEFINITIONS[muscleId];
          const percentage = (volume[muscleId] / 24) * 100;

          return (
            <div key={muscleId}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-100">{muscle.label}</span>
                <span className="text-slate-300">
                  {volume[muscleId]} series · nivel {levels[muscleId]}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    background: muscle.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
