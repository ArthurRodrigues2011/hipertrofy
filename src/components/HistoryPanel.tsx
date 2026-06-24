import type { PlanChange } from "../types/training";

interface HistoryPanelProps {
  history: PlanChange[];
  onClear: () => void;
}

export function HistoryPanel({ history, onClear }: HistoryPanelProps) {
  return (
    <section className="glass-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Alteracoes</p>
          <h2 className="section-title">Historico recente</h2>
        </div>
        {history.length > 0 && (
          <button type="button" className="btn-mini" onClick={onClear}>
            Limpar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-slate-400">
          Os ajustes feitos no plano aparecem aqui.
        </p>
      ) : (
        <div className="space-y-3">
          {history.slice(0, 8).map((change) => (
            <article key={change.id} className="border-l-2 border-teal-300/60 pl-3">
              <p className="font-semibold text-white">{change.title}</p>
              <p className="text-sm text-slate-300">{change.detail}</p>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(change.createdAt).toLocaleString("pt-BR")}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
