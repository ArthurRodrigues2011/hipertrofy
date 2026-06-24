import { PRESETS } from "../utils/presets";

interface PresetsPanelProps {
  onApplyPreset: (presetId: string) => void;
}

export function PresetsPanel({ onApplyPreset }: PresetsPanelProps) {
  return (
    <section className="glass-card p-5">
      <div className="mb-4">
        <p className="eyebrow">Modos prontos</p>
        <h2 className="section-title">Presets</h2>
      </div>

      <div className="grid gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="preset-button"
            onClick={() => onApplyPreset(preset.id)}
          >
            <span className="font-semibold text-white">{preset.name}</span>
            <span className="text-left text-xs text-slate-400">{preset.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
