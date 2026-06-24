import { useState } from "react";
import {
  MUSCLES,
  type ExerciseLibrary,
  type MuscleId,
} from "../types/training";

interface ExerciseLibraryPanelProps {
  exerciseLibrary: ExerciseLibrary;
  onAddExercise: (muscleId: MuscleId, name: string) => void;
  onRemoveExercise: (muscleId: MuscleId, exerciseId: string) => void;
}

export function ExerciseLibraryPanel({
  exerciseLibrary,
  onAddExercise,
  onRemoveExercise,
}: ExerciseLibraryPanelProps) {
  const [drafts, setDrafts] = useState<Partial<Record<MuscleId, string>>>({});

  function submitExercise(muscleId: MuscleId) {
    const name = drafts[muscleId]?.trim();
    if (!name) {
      return;
    }

    onAddExercise(muscleId, name);
    setDrafts((current) => ({ ...current, [muscleId]: "" }));
  }

  return (
    <section className="glass-card p-5 lg:p-6">
      <div className="mb-5">
        <p className="eyebrow">Biblioteca</p>
        <h2 className="section-title">Exercicios por musculo</h2>
        <p className="mt-2 text-sm text-slate-400">
          Cadastre exercicios e o app distribui as series sugeridas nos dias correspondentes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {MUSCLES.map((muscle) => (
          <article key={muscle.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <h3 className="font-black text-white">{muscle.label}</h3>
            <div className="mt-3 flex gap-2">
              <input
                className="input-dark"
                value={drafts[muscle.id] ?? ""}
                placeholder="Novo exercicio"
                onChange={(event) =>
                  setDrafts((current) => ({ ...current, [muscle.id]: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitExercise(muscle.id);
                  }
                }}
              />
              <button type="button" className="btn-mini" onClick={() => submitExercise(muscle.id)}>
                Add
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {exerciseLibrary[muscle.id].map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-black/20 px-3 py-2 text-sm"
                >
                  <span className="truncate text-slate-200">{exercise.name}</span>
                  <button
                    type="button"
                    className="text-xs font-bold text-rose-200 hover:text-rose-100"
                    onClick={() => onRemoveExercise(muscle.id, exercise.id)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
