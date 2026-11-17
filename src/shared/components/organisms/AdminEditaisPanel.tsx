"use client";

import { useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { INITIAL_JOBS, type IngestJob } from "@/app/lib/admin-editais-fixture";
import { canPublish, listPendingReasons, type ExtractedRequirement } from "@/shared/lib/requirement-review";
import RequirementReviewRow from "@/shared/components/molecules/RequirementReviewRow";
import StatusBadge from "@/shared/components/molecules/StatusBadge";

export default function AdminEditaisPanel() {
  const [jobs, setJobs] = useState<IngestJob[]>(INITIAL_JOBS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = jobs.find((job) => job.id === selectedId) ?? null;

  const updateJob = (id: string, patch: Partial<IngestJob>) =>
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...patch } : job)));

  const updateRequirement = (job: IngestJob, reqId: string, patch: Partial<ExtractedRequirement>) =>
    updateJob(job.id, { requirements: job.requirements.map((req) => (req.id === reqId ? { ...req, ...patch } : req)) });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = `job-${Date.now()}`;
    setJobs((prev) => [
      { id, title: file.name.replace(/\.pdf$/i, ""), fileName: file.name, uploadedAt: new Date().toISOString().slice(0, 10), status: "PROCESSING", requirements: [] },
      ...prev,
    ]);
    setSelectedId(id);
    e.target.value = "";
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <p role="note" className="rounded-xl bg-(--accent-soft) border border-(--accent) px-4 py-3 text-sm text-(--accent-ink)">
        Prévia: os arquivos não são enviados nem processados, e nada é publicado de verdade. A extração e a fila chegam com a O3.
      </p>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-(--border-subtle) px-4 py-6 text-sm font-semibold text-(--text-muted) hover:border-(--primary-fg) hover:text-(--primary-fg)">
        <FileUp size={18} aria-hidden="true" />
        <span>Enviar PDF do edital</span>
        <input type="file" accept="application/pdf" className="sr-only" onChange={handleUpload} />
      </label>

      {jobs.length === 0 ? (
        <p className="text-sm text-(--text-muted)">Nenhum edital enviado ainda.</p>
      ) : (
        <ul aria-label="Editais enviados" className="divide-y divide-(--border-subtle) rounded-xl border border-(--border-subtle) bg-(--bg-card)">
          {jobs.map((job) => (
            <li key={job.id}>
              <button
                type="button"
                onClick={() => setSelectedId(job.id)}
                aria-current={job.id === selectedId}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-(--surface-subtle) cursor-pointer aria-[current=true]:bg-(--primary-soft)"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-(--foreground)">{job.title}</span>
                  <span className="block truncate text-xs text-(--text-subtle)">
                    {job.fileName} · {job.uploadedAt}
                  </span>
                </span>
                <StatusBadge status={job.status} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <section aria-label={`Detalhe de ${selected.title}`} className="space-y-3">
          <h2 className="text-base font-bold text-(--foreground)">{selected.title}</h2>

          {selected.status === "PROCESSING" && (
            <p role="status" className="flex items-center gap-2 text-sm text-(--text-muted)">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Lendo o documento e extraindo os requisitos...
            </p>
          )}

          {selected.status === "FAILED" && (
            <div role="alert" className="space-y-2 rounded-xl border border-(--danger-border) bg-(--danger-soft) p-4 text-sm text-(--danger)">
              <p>{selected.failureReason}</p>
              <button
                type="button"
                onClick={() => updateJob(selected.id, { status: "PROCESSING", failureReason: undefined })}
                className="rounded-lg border border-(--danger-border) px-3 py-1.5 font-bold hover:bg-(--bg-card) cursor-pointer"
              >
                Tentar de novo
              </button>
            </div>
          )}

          {(selected.status === "REVIEW" || selected.status === "PUBLISHED") && (
            <>
              <ul className="space-y-2.5">
                {selected.requirements.map((req) => (
                  <RequirementReviewRow
                    key={req.id}
                    requirement={req}
                    disabled={selected.status === "PUBLISHED"}
                    onChange={(patch) => updateRequirement(selected, req.id, patch)}
                  />
                ))}
              </ul>

              {selected.status === "REVIEW" && (
                <div className="space-y-2">
                  {!canPublish(selected.requirements) && (
                    <p className="text-xs text-(--text-muted)">
                      Falta resolver {listPendingReasons(selected.requirements).length} pendência(s) para publicar.
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={!canPublish(selected.requirements)}
                    onClick={() => updateJob(selected.id, { status: "PUBLISHED" })}
                    className="px-5 py-2.5 rounded-xl bg-(--primary) text-white text-sm font-bold hover:bg-(--primary-hover) disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Aprovar e publicar no feed
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
