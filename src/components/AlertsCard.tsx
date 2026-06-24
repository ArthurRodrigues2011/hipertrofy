import type { PlanAlert } from "../types/training";

interface AlertsCardProps {
  alerts: PlanAlert[];
}

const severityClasses = {
  info: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  warning: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  danger: "border-rose-300/20 bg-rose-300/10 text-rose-100",
};

export function AlertsCard({ alerts }: AlertsCardProps) {
  return (
    <section className="glass-card p-5">
      <div className="mb-4">
        <p className="eyebrow">Heuristicas</p>
        <h2 className="section-title">Alertas inteligentes</h2>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-3 ${severityClasses[alert.severity]}`}
          >
            <p className="font-semibold">{alert.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-200">{alert.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
