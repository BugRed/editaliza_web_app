"use client";

import { useState } from "react";
import {
  checkTrajectoryDraft,
  EVIDENCE_LABELS,
  EXPERIENCE_CATEGORIES,
  durationMonths,
  sortTrajectory,
  summarizeTrajectory,
  type EvidenceStatus,
  type ExperienceCategory,
  type TrajectoryDraft,
  type TrajectoryEntry,
} from "@/shared/lib/trajectory";
import { TextInput, SelectInput } from "@/shared/components/atoms/FormControls";
import SubmitButton from "@/shared/components/atoms/SubmitButton";
import FormField from "@/shared/components/molecules/FormField";

const EMPTY_DRAFT: TrajectoryDraft = {
  category: "Formação",
  title: "",
  institution: "",
  role: "",
  startDate: "",
  endDate: "",
  evidenceStatus: "declared",
};

const SAMPLE: TrajectoryEntry[] = [
  { id: "t1", category: "Experiência profissional", title: "Estágio em produção cultural", institution: "Instituição cultural", role: "Assistente", startDate: "2024-03-01", endDate: "2024-12-01", evidenceStatus: "verified" },
];

// A lista vive só nesta tela: ainda não há onde gravar a trajetória (O4).
export default function TrajectoryEditor() {
  const [entries, setEntries] = useState<TrajectoryEntry[]>(SAMPLE);
  const [draft, setDraft] = useState<TrajectoryDraft>(EMPTY_DRAFT);
  const [error, setError] = useState("");
  const now = new Date();
  const summary = summarizeTrajectory(entries, now);
  const patch = (changes: Partial<TrajectoryDraft>) => setDraft((prev) => ({ ...prev, ...changes }));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = checkTrajectoryDraft(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setEntries((prev) => [...prev, { ...draft, id: `t-${Date.now()}`, title: draft.title.trim() }]);
    setDraft(EMPTY_DRAFT);
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <p role="note" className="rounded-xl bg-(--accent-soft) border border-(--accent) px-4 py-3 text-sm text-(--accent-ink)">
        Prévia: a trajetória ainda não é gravada. Estágios e experiências em início de carreira contam, e nenhuma experiência é obrigatória.
      </p>

      <p role="status" className="text-sm text-(--text-muted)">
        {summary.count === 0
          ? "Nenhuma experiência registrada ainda."
          : `${summary.count} experiência(s), ${summary.verified} verificada(s), ${summary.totalMonths} meses somados em ${summary.categories.length} categoria(s).`}
      </p>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--border-subtle) p-6 text-center text-sm text-(--text-muted)">
          Sem trajetória por enquanto. Quando houver, registre aqui; sem comprovação, a experiência fica como declarada.
        </p>
      ) : (
        <ul aria-label="Experiências" className="divide-y divide-(--border-subtle) rounded-xl border border-(--border-subtle) bg-(--bg-card)">
          {sortTrajectory(entries).map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-bold text-(--foreground)">{entry.title}</p>
                <p className="text-xs text-(--text-muted)">
                  {entry.category} · {entry.institution || "sem instituição"}
                  {entry.role ? ` · ${entry.role}` : ""}
                </p>
                <p className="text-xs text-(--text-subtle) tabular-nums">
                  {entry.startDate} a {entry.endDate || "em andamento"} · {durationMonths(entry, now)} mês(es)
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="rounded-md border border-(--border-subtle) bg-(--surface-subtle) px-2 py-0.5 text-[11px] font-bold text-(--text-muted)">
                  {EVIDENCE_LABELS[entry.evidenceStatus]}
                </span>
                <button
                  type="button"
                  aria-label={`Remover ${entry.title}`}
                  onClick={() => setEntries((prev) => prev.filter((x) => x.id !== entry.id))}
                  className="text-xs font-semibold text-(--danger) hover:underline cursor-pointer"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="space-y-4 rounded-xl border border-(--border-subtle) bg-(--bg-card) p-4 sm:p-5">
        <h2 className="text-base font-bold text-(--foreground)">Adicionar experiência</h2>
        {error && (
          <p role="alert" className="rounded-lg border border-(--danger-border) bg-(--danger-soft) px-3 py-2 text-sm text-(--danger)">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="tr-category" label="Categoria">
            <SelectInput id="tr-category" value={draft.category} onChange={(e) => patch({ category: e.target.value as ExperienceCategory })}>
              {EXPERIENCE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField id="tr-title" label="Título">
            <TextInput id="tr-title" value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
          </FormField>
          <FormField id="tr-inst" label="Instituição">
            <TextInput id="tr-inst" value={draft.institution} onChange={(e) => patch({ institution: e.target.value })} />
          </FormField>
          <FormField id="tr-role" label="Função">
            <TextInput id="tr-role" value={draft.role} onChange={(e) => patch({ role: e.target.value })} />
          </FormField>
          <FormField id="tr-start" label="Início">
            <TextInput id="tr-start" type="date" value={draft.startDate} onChange={(e) => patch({ startDate: e.target.value })} />
          </FormField>
          <FormField id="tr-end" label="Término (vazio se em andamento)">
            <TextInput id="tr-end" type="date" value={draft.endDate} onChange={(e) => patch({ endDate: e.target.value })} />
          </FormField>
        </div>
        <FormField id="tr-evidence" label="Comprovação">
          <SelectInput id="tr-evidence" value={draft.evidenceStatus} onChange={(e) => patch({ evidenceStatus: e.target.value as EvidenceStatus })}>
            {(Object.keys(EVIDENCE_LABELS) as EvidenceStatus[]).map((status) => (
              <option key={status} value={status}>
                {EVIDENCE_LABELS[status]}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <SubmitButton saving={false} label="Adicionar" />
      </form>
    </div>
  );
}
