import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { RadarDatum } from "../types/training";

interface RadarChartPanelProps {
  data: RadarDatum[];
  totalWeeklyVolume: number;
  splitName: string;
}

function RadarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RadarDatum }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-950/95 px-3 py-2 text-sm shadow-panel">
      <p className="font-semibold text-white">{item.muscle}</p>
      <p className="text-cyan-200">Nivel {item.nivel}/10</p>
      <p className="text-slate-300">{item.series} series semanais</p>
    </div>
  );
}

export function RadarChartPanel({ data, totalWeeklyVolume, splitName }: RadarChartPanelProps) {
  return (
    <section className="glass-card min-h-[520px] p-5 lg:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Painel principal</p>
          <h2 className="section-title">Distribuicao de foco muscular</h2>
        </div>
        <div className="rounded-lg border border-teal-300/20 bg-teal-300/10 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.22em] text-teal-100/70">Volume total</p>
          <p className="text-2xl font-black text-white">{totalWeeklyVolume}</p>
          <p className="text-xs text-teal-100/80">series por semana</p>
        </div>
      </div>

      <div className="h-[380px] w-full sm:h-[430px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="74%">
            <PolarGrid gridType="polygon" stroke="rgba(148, 163, 184, 0.24)" />
            <PolarAngleAxis
              dataKey="muscle"
              tick={{ fill: "#d7f7ef", fontSize: 12, fontWeight: 700 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickCount={6}
            />
            <Radar
              name="Nivel"
              dataKey="nivel"
              stroke="#2dd4bf"
              fill="#14b8a6"
              fillOpacity={0.38}
              strokeWidth={3}
              isAnimationActive
            />
            <Tooltip content={<RadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
        <span className="badge badge-teal">Split sugerido</span>
        <span className="font-semibold text-white">{splitName}</span>
      </div>
    </section>
  );
}
