import type { CSSProperties } from "react";
import {
  MUSCLES,
  type MuscleId,
  type MuscleLevelMap,
  type TrainingDays,
  type WeeklyVolumeMap,
} from "../types/training";
import { MAX_LEVEL, MIN_LEVEL } from "../utils/volume";

interface MuscleSliderPanelProps {
  levels: MuscleLevelMap;
  volume: WeeklyVolumeMap;
  trainingDays: TrainingDays;
  keepBalanced: boolean;
  onLevelChange: (muscleId: MuscleId, value: number) => void;
  onTrainingDaysChange: (days: TrainingDays) => void;
  onKeepBalancedChange: (enabled: boolean) => void;
}

const trainingDayOptions: TrainingDays[] = [3, 4, 5, 6];

export function MuscleSliderPanel({
  levels,
  volume,
  trainingDays,
  keepBalanced,
  onLevelChange,
  onTrainingDaysChange,
  onKeepBalancedChange,
}: MuscleSliderPanelProps) {
  return (
    <section className="glass-card p-5">
      <div className="mb-5">
        <p className="eyebrow">Controle</p>
        <h2 className="section-title">Foco por musculo</h2>
      </div>

      <div className="space-y-5">
        {MUSCLES.map((muscle) => {
          const level = levels[muscle.id];
          const sliderStyle = {
            "--slider-value": `${((level - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL)) * 100}%`,
            "--slider-color": muscle.color,
          } as CSSProperties;

          return (
            <div key={muscle.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{muscle.label}</p>
                  <p className="text-xs text-slate-400">{volume[muscle.id]} series semanais</p>
                </div>
                <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-sm font-black text-white">
                  {level}
                </span>
              </div>
              <input
                className="muscle-range"
                type="range"
                min={MIN_LEVEL}
                max={MAX_LEVEL}
                step={1}
                value={level}
                style={sliderStyle}
                aria-label={`Nivel de foco para ${muscle.label}`}
                onChange={(event) => onLevelChange(muscle.id, Number(event.target.value))}
              />
            </div>
          );
        })}
      </div>

      <div className="my-6 h-px bg-white/10" />

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-200">Dias de treino</p>
          <div className="grid grid-cols-4 gap-2">
            {trainingDayOptions.map((days) => (
              <button
                key={days}
                type="button"
                className={days === trainingDays ? "segmented-active" : "segmented"}
                onClick={() => onTrainingDaysChange(days)}
              >
                {days}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <span>
            <span className="block font-semibold text-white">Manter volume total equilibrado</span>
            <span className="text-xs text-slate-400">Reduz os demais focos quando um musculo sobe muito.</span>
          </span>
          <input
            className="sr-only"
            type="checkbox"
            checked={keepBalanced}
            onChange={(event) => onKeepBalancedChange(event.target.checked)}
          />
          <span className={keepBalanced ? "switch switch-on" : "switch"}>
            <span />
          </span>
        </label>
      </div>
    </section>
  );
}
