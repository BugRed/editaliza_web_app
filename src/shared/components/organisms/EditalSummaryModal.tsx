"use client";

import Link from "next/link";
import { getEditalProposerHref } from "@/shared/lib/edital-owner";
import RankBars from "@/shared/components/organisms/RankBars";
import { useEffect } from "react";
import { Bookmark, ExternalLink, X } from "lucide-react";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import { resolveExternalUrl } from "@/app/lib/edital-detail";
import EditalDetailBody from "@/shared/components/organisms/EditalDetailBody";

export default function EditalSummaryModal() {
  const {
    activeEditalModal,
    closeEditalModal,
    isEditalSaved,
    toggleSaveEdital,
  } = useSocialStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEditalModal();
    };
    if (activeEditalModal) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeEditalModal, closeEditalModal]);

  if (!activeEditalModal) return null;

  const { edital, proposerName, rank } = activeEditalModal;
  const saved = isEditalSaved(edital.id);
  const proposerHref = getEditalProposerHref(edital);

  const externalUrl = resolveExternalUrl(edital);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim)/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edital-modal-title"
      onClick={closeEditalModal}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-(--bg-card) border border-(--border-subtle) rounded-2xl shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-(--bg-card)/95 backdrop-blur border-b border-(--border-subtle) px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-(--primary-fg)">
              Resumo direto · Sem academiquês
            </p>
            <h2
              id="edital-modal-title"
              className="text-xl sm:text-2xl font-bold text-(--foreground) mt-0.5 leading-snug"
            >
              {edital.title}
            </h2>
            <p className="text-sm text-(--text-muted) mt-0.5">
              Organizado por{" "}
              {proposerHref ? (
                <Link
                  href={proposerHref}
                  onClick={closeEditalModal}
                  className="font-medium text-(--primary-fg) hover:underline"
                >
                  {proposerName}
                </Link>
              ) : (
                <span className="font-medium text-(--foreground)">{proposerName}</span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={closeEditalModal}
            aria-label="Fechar resumo do edital"
            className="w-9 h-9 rounded-full flex items-center justify-center text-(--text-muted) hover:bg-(--surface-subtle) hover:text-(--foreground) transition-colors shrink-0 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body well distributed */}
        <div className="p-6 space-y-6">
          {rank && <RankBars rank={rank} />}
          <EditalDetailBody edital={edital} />
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 bg-(--bg-card) border-t border-(--border-subtle) px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => toggleSaveEdital(edital.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
              saved
                ? "bg-(--accent-soft) border-(--accent) text-(--accent-ink)"
                : "bg-(--bg-card) border-(--border-subtle) text-(--foreground) hover:bg-(--surface-subtle)"
            }`}
          >
            <Bookmark size={16} className={saved ? "fill-(--accent) text-(--accent-ink)" : ""} />
            <span>{saved ? "Salvo nos seus editais" : "Salvar edital"}</span>
          </button>

          <div className="flex items-center gap-2.5 ml-auto">
            <Link
              href={`/editais/${edital.id}`}
              onClick={closeEditalModal}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-(--primary-fg) hover:bg-(--surface-subtle) transition-colors"
            >
              Ver página completa
            </Link>
            <button
              type="button"
              onClick={closeEditalModal}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-(--text-muted) hover:bg-(--surface-subtle) transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--primary) hover:bg-(--primary-hover) text-white text-sm font-bold transition-colors whitespace-nowrap"
            >
              <span>Ir para o edital</span>
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
