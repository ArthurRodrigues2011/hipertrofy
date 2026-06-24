import type { PlanSnapshot } from "../types/training";

interface SnapshotPanelProps {
  snapshots: PlanSnapshot[];
  onSave: () => void;
  onLoad: (snapshotId: string) => void;
  onDelete: (snapshotId: string) => void;
}

export function SnapshotPanel({ snapshots, onSave, onLoad, onDelete }: SnapshotPanelProps) {
  return (
    <section className="glass-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Historico salvo</p>
          <h2 className="section-title">Snapshots do plano</h2>
        </div>
        <button type="button" className="btn-secondary shrink-0" onClick={onSave}>
          Salvar
        </button>
      </div>

      {snapshots.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-slate-400">
          Nenhum snapshot salvo ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {snapshots.map((snapshot) => (
            <article key={snapshot.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <div className="mb-3">
                <p className="font-semibold text-white">{snapshot.name}</p>
                <p className="text-xs text-slate-400">
                  {new Date(snapshot.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn-mini" onClick={() => onLoad(snapshot.id)}>
                  Carregar
                </button>
                <button type="button" className="btn-mini-danger" onClick={() => onDelete(snapshot.id)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
