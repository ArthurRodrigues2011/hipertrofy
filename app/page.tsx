"use client";

import {
  Activity,
  Dumbbell,
  Lock,
  Radar,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar as RadarShape,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type Muscle = "Costas" | "Peito" | "Pernas" | "Bíceps" | "Tríceps" | "OmbroLateral";
type Levels = Record<Muscle, number>;
type WeeksAtMax = Record<Muscle, number>;

const muscles: Muscle[] = ["Costas", "Peito", "Pernas", "Bíceps", "Tríceps", "OmbroLateral"];

const muscleLabels: Record<Muscle, string> = {
  Costas: "Costas",
  Peito: "Peito",
  Pernas: "Pernas",
  Bíceps: "Bíceps",
  Tríceps: "Tríceps",
  OmbroLateral: "Ombro lateral",
};

const defaultLevels: Levels = {
  Costas: 5,
  Peito: 5,
  Pernas: 5,
  Bíceps: 5,
  Tríceps: 5,
  OmbroLateral: 5,
};

const defaultWeeks: WeeksAtMax = {
  Costas: 0,
  Peito: 0,
  Pernas: 0,
  Bíceps: 0,
  Tríceps: 0,
  OmbroLateral: 0,
};

const rirCopy: Record<number, string> = {
  0: "Falha total: volume real reduzido em 20%.",
  1: "Alta tensão: mantenha recuperação sob vigilância.",
  2: "Volume produtivo: carga completa para hipertrofia.",
  3: "Pump técnico: volume integral e menor desgaste neural.",
};

const clampLevel = (value: number) => Math.min(10, Math.max(1, value));
const weeklySets = (level: number, rir: number) => level * 2.5 * (rir === 0 ? 0.8 : 1);

function readStoredRecord<K extends string>(
  key: string,
  fallback: Record<K, number>,
  min: number,
  max: number,
) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Record<K, unknown>>;
    const result = { ...fallback };

    (Object.keys(fallback) as K[]).forEach((keyName) => {
      const value = Number(parsed[keyName]);
      result[keyName] = Number.isFinite(value)
        ? Math.min(max, Math.max(min, value))
        : fallback[keyName];
    });

    return result;
  } catch {
    return fallback;
  }
}

export default function Home() {
  const [levels, setLevels] = useState<Levels>(defaultLevels);
  const [weeksAtMax, setWeeksAtMax] = useState<WeeksAtMax>(defaultWeeks);
  const [rir, setRir] = useState(2);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLevels(readStoredRecord("niveis", defaultLevels, 1, 10));
    setWeeksAtMax(readStoredRecord("semanas_no_maximo", defaultWeeks, 0, 12));

    const rawRir = window.localStorage.getItem("rir_global");
    const storedRir = rawRir === null ? Number.NaN : Number(rawRir);
    setRir(Number.isFinite(storedRir) ? Math.min(3, Math.max(0, storedRir)) : 2);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem("niveis", JSON.stringify(levels));
    window.localStorage.setItem("semanas_no_maximo", JSON.stringify(weeksAtMax));
    window.localStorage.setItem("rir_global", String(rir));
  }, [levels, weeksAtMax, rir, loaded]);

  const fatiguedMuscles = useMemo(
    () => muscles.filter((muscle) => weeksAtMax[muscle] >= 3),
    [weeksAtMax],
  );
  const deloadActive = fatiguedMuscles.length > 0;
  const totalSets = muscles.reduce((sum, muscle) => sum + weeklySets(levels[muscle], rir), 0);

  const biomechanicFocus =
    levels.Costas > 7
      ? "Foco em Puxadas Verticais (Largura/Dorsal)"
      : levels.Costas < 4
        ? "Foco em Remadas (Espessura/Miolo)"
        : "Equilíbrio entre Puxadas Verticais e Remadas";

  const radarData = muscles.map((muscle) => ({
    muscle: muscleLabels[muscle].replace("Ombro lateral", "Ombro"),
    perfil: Number(weeklySets(levels[muscle], rir).toFixed(1)),
    nivel: levels[muscle],
  }));

  const setMuscleLevel = (muscle: Muscle, level: number) => {
    if (deloadActive) return;
    setLevels((current) => ({
      ...current,
      [muscle]: clampLevel(level),
    }));
  };

  const activateVShape = () => {
    if (deloadActive) return;
    setLevels((current) => ({
      ...current,
      Costas: clampLevel(current.Costas + 3),
      OmbroLateral: clampLevel(current.OmbroLateral + 3),
      Pernas: clampLevel(current.Pernas - 2),
      Peito: clampLevel(current.Peito - 1),
    }));
  };

  const registerWeek = () => {
    setWeeksAtMax((current) =>
      muscles.reduce(
        (acc, muscle) => ({
          ...acc,
          [muscle]: levels[muscle] === 10 ? current[muscle] + 1 : 0,
        }),
        {} as WeeksAtMax,
      ),
    );
  };

  const applyDeload = () => {
    setLevels((current) =>
      fatiguedMuscles.reduce(
        (acc, muscle) => ({
          ...acc,
          [muscle]: 4,
        }),
        current,
      ),
    );
    setWeeksAtMax((current) =>
      fatiguedMuscles.reduce(
        (acc, muscle) => ({
          ...acc,
          [muscle]: 0,
        }),
        current,
      ),
    );
  };

  const resetFatigue = () => {
    setWeeksAtMax(defaultWeeks);
  };

  return (
    <main className="min-h-screen bg-slateCore radar-grid px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-cyan-400/15 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Radar Treino Elite
            </p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Periodização visual para volume inteligente
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric label="Séries totais" value={totalSets.toFixed(1)} />
            <Metric label="RIR global" value={String(rir)} />
            <Metric label="Status" value={deloadActive ? "Deload" : "Ativo"} accent={deloadActive} />
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)_390px]">
          <aside className="rounded-lg border border-slate-700/80 bg-slate-950/70 p-4 shadow-glow">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Prescrição</h2>
                <p className="text-sm text-slate-400">Nível 1-10 convertido em 2.5-25 séries.</p>
              </div>
              {deloadActive ? <Lock className="h-5 w-5 text-red-300" /> : <Dumbbell className="h-5 w-5 text-cyan-300" />}
            </div>

            <div className="space-y-4">
              {muscles.map((muscle) => (
                <SliderRow
                  key={muscle}
                  label={muscleLabels[muscle]}
                  value={levels[muscle]}
                  disabled={deloadActive}
                  onChange={(value) => setMuscleLevel(muscle, value)}
                  suffix={`${weeklySets(levels[muscle], rir).toFixed(1)} séries`}
                />
              ))}
            </div>

            <div className="my-5 h-px bg-slate-700/70" />

            <SliderRow
              label="RIR global"
              value={rir}
              min={0}
              max={3}
              disabled={deloadActive}
              onChange={setRir}
              suffix={`RIR ${rir}`}
            />
            <p className="mt-2 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
              {rirCopy[rir]}
            </p>

            <button
              type="button"
              onClick={activateVShape}
              disabled={deloadActive}
              className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-cyan-400 px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              <Sparkles className="h-4 w-4" />
              Ativar Modo V-Shape
            </button>
          </aside>

          <section className="space-y-5">
            {deloadActive && (
              <div className="rounded-lg border border-red-400/50 bg-red-500/12 p-4 shadow-glow">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-red-200">
                      <Lock className="h-5 w-5" />
                      <h2 className="text-lg font-black">Deload obrigatório</h2>
                    </div>
                    <p className="mt-2 text-sm text-red-100">
                      {fatiguedMuscles.map((muscle) => muscleLabels[muscle]).join(", ")} chegou a 3 semanas no máximo. Reduza para nível 4 por uma semana.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={applyDeload}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-300 px-4 text-sm font-black text-red-950 transition hover:bg-red-200"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Aplicar Deload
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-700/80 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-cyan-200">
                  <TrendingUp className="h-5 w-5" />
                  <h2 className="text-lg font-bold text-white">Séries Semanais Reais</h2>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {muscles.map((muscle) => (
                    <div key={muscle} className="rounded-md border border-slate-700/80 bg-slate-900/80 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-400">{muscleLabels[muscle]}</p>
                      <p className="mt-2 text-2xl font-black text-white">
                        {weeklySets(levels[muscle], rir).toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-700/80 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-violet-200">
                  <Activity className="h-5 w-5" />
                  <h2 className="text-lg font-bold text-white">Recomendação Biomecânica</h2>
                </div>
                <p className="mt-4 text-2xl font-black leading-tight text-violet-100">
                  {biomechanicFocus}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={registerWeek}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan-400/40 px-4 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/10"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Registrar Semana
                  </button>
                  <button
                    type="button"
                    onClick={resetFatigue}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-600 px-4 text-sm font-bold text-slate-200 transition hover:bg-slate-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Fadiga
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700/80 bg-slate-950/70 p-4">
              <h2 className="text-lg font-bold text-white">Mapa de Calor</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {muscles.map((muscle) => {
                  const sets = weeklySets(levels[muscle], rir);
                  const heat = getHeat(sets, weeksAtMax[muscle]);

                  return (
                    <div
                      key={muscle}
                      className={`rounded-lg border p-4 ${heat.className}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-white">{muscleLabels[muscle]}</p>
                          <p className="mt-1 text-xs font-semibold uppercase text-white/70">{heat.label}</p>
                        </div>
                        <span className="rounded-md bg-black/20 px-2 py-1 text-xs font-black text-white">
                          N{levels[muscle]}
                        </span>
                      </div>
                      <div className="mt-5 flex items-end justify-between gap-3">
                        <p className="text-3xl font-black text-white">{sets.toFixed(1)}</p>
                        <p className="text-right text-xs font-semibold text-white/75">
                          {weeksAtMax[muscle]} sem. no máximo
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="rounded-lg border border-slate-700/80 bg-slate-950/70 p-4 shadow-glow">
            <div className="mb-4 flex items-center gap-2">
              <Radar className="h-5 w-5 text-fuchsia-300" />
              <h2 className="text-lg font-bold text-white">Perfil Atual</h2>
            </div>
            <div className="h-[340px] w-full sm:h-[420px] xl:h-[540px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="74%">
                  <PolarGrid stroke="rgba(148, 163, 184, 0.35)" />
                  <PolarAngleAxis
                    dataKey="muscle"
                    tick={{ fill: "#c4b5fd", fontSize: 12, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 25]}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    stroke="rgba(148, 163, 184, 0.25)"
                  />
                  <RadarShape
                    name="Séries reais"
                    dataKey="perfil"
                    stroke="#22d3ee"
                    fill="#a855f7"
                    fillOpacity={0.42}
                    strokeWidth={3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  suffix,
  disabled = false,
  min = 1,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-bold text-slate-200">{label}</label>
        <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-black text-cyan-200">
          {suffix}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_2rem] items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer"
          aria-label={label}
        />
        <output className="text-right text-sm font-black text-white">{value}</output>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-md border px-3 py-2 ${accent ? "border-red-300/40 bg-red-400/10" : "border-slate-700 bg-slate-950/70"}`}>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function getHeat(sets: number, weeks: number) {
  if (weeks >= 2 || sets >= 20) {
    return {
      label: "Fadiga alta",
      className: "border-red-300/45 bg-red-500/25",
    };
  }

  if (sets >= 10) {
    return {
      label: "Hipertrofia",
      className: "border-orange-300/45 bg-orange-500/25",
    };
  }

  return {
    label: "Manutenção",
    className: "border-blue-300/45 bg-blue-500/25",
  };
}
