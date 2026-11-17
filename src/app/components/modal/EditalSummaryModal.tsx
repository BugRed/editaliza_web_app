"use client";

import Link from "next/link";
import { getEditalProposerHref } from "@/shared/lib/edital-owner";
import RankBars from "@/app/components/rank/RankBars";
import { useEffect } from "react";
import {
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import { getPlainEditalSummary } from "@/app/lib/user-profiles";
import { SafeDate } from "@/app/lib/utils/SafeDate";
import { PlainEditalSummaryData } from "@/app/types/Edital";
import { TagData } from "@/app/types/TagData";

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

  const dbPlainSummary: PlainEditalSummaryData | null = (() => {
    if (!edital.plainSummary) return null;
    if (typeof edital.plainSummary === "string") {
      try {
        return JSON.parse(edital.plainSummary) as PlainEditalSummaryData;
      } catch {
        return null;
      }
    }
    return edital.plainSummary as PlainEditalSummaryData;
  })();

  const summary: PlainEditalSummaryData =
    dbPlainSummary && dbPlainSummary.whatIsIt
      ? dbPlainSummary
      : getPlainEditalSummary(edital.id, edital.title, edital.description);

  const rawTags: TagData[] = Array.isArray(edital.listTags)
    ? edital.listTags
    : typeof edital.listTags === "string"
    ? (() => {
        try {
          return JSON.parse(edital.listTags);
        } catch {
          return [];
        }
      })()
    : [];

  const allTagNames = Array.from(
    new Set([
      ...rawTags.map((t) => t.name).filter(Boolean),
      ...(Array.isArray(summary.extraTags) ? summary.extraTags : []),
    ])
  );

  const externalUrl =
    (edital.inscriptionLink && edital.inscriptionLink.trim()) ||
    (edital.completeEditalLink && edital.completeEditalLink.trim()) ||
    "#";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102A30]/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edital-modal-title"
      onClick={closeEditalModal}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-[#DCE6E8] rounded-2xl shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#DCE6E8] px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0E7C86]">
              Resumo direto · Sem academiquês
            </p>
            <h2
              id="edital-modal-title"
              className="text-xl sm:text-2xl font-bold text-[#102A30] mt-0.5 leading-snug"
            >
              {edital.title}
            </h2>
            <p className="text-sm text-[#4A656B] mt-0.5">
              Organizado por{" "}
              {proposerHref ? (
                <Link
                  href={proposerHref}
                  onClick={closeEditalModal}
                  className="font-medium text-[#0E7C86] hover:underline"
                >
                  {proposerName}
                </Link>
              ) : (
                <span className="font-medium text-[#102A30]">{proposerName}</span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={closeEditalModal}
            aria-label="Fechar resumo do edital"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#4A656B] hover:bg-[#F0F6F7] hover:text-[#102A30] transition-colors shrink-0 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body well distributed */}
        <div className="p-6 space-y-6">
          {rank && <RankBars rank={rank} />}

          {/* O que é */}
          <section className="bg-[#F8FAFB] border border-[#DCE6E8] rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0E7C86] mb-2">
              <Sparkles size={16} aria-hidden="true" />
              <span>O que é este edital na prática?</span>
            </div>
            <p className="text-[15px] text-[#102A30] leading-relaxed">
              {summary.whatIsIt}
            </p>
          </section>

          {/* 2-column structured details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <section className="border border-[#DCE6E8] rounded-xl p-4 bg-white">
              <div className="flex items-center gap-2 text-sm font-bold text-[#102A30] mb-2.5">
                <Users size={16} className="text-[#0E7C86]" aria-hidden="true" />
                <span>Quem pode participar</span>
              </div>
              <ul className="space-y-2 text-sm text-[#4A656B] leading-relaxed">
                {summary.whoCanApply.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0E7C86] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border border-[#DCE6E8] rounded-xl p-4 bg-white">
              <div className="flex items-center gap-2 text-sm font-bold text-[#102A30] mb-2.5">
                <CheckCircle2 size={16} className="text-[#0E7C86]" aria-hidden="true" />
                <span>O que você recebe</span>
              </div>
              <ul className="space-y-2 text-sm text-[#4A656B] leading-relaxed">
                {summary.benefits.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FFB800] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Dates grid */}
          <section className="grid grid-cols-2 gap-4 border border-[#DCE6E8] rounded-xl p-4 bg-[#F8FAFB]">
            <div>
              <span className="text-xs font-medium text-[#6B8388] block">
                Publicado em
              </span>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-[#102A30] tabular-nums">
                <CalendarDays size={15} className="text-[#0E7C86]" aria-hidden="true" />
                {SafeDate(edital.publishDate)}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-[#6B8388] block">
                Prazo de inscrição
              </span>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-[#102A30] tabular-nums">
                <CalendarDays size={15} className="text-[#B45309]" aria-hidden="true" />
                {edital.endDate ? SafeDate(edital.endDate) : "Fluxo contínuo"}
              </span>
            </div>
          </section>

          {/* All tags well distributed */}
          <section>
            <div className="flex items-center gap-2 text-sm font-bold text-[#102A30] mb-3">
              <Tag size={15} className="text-[#0E7C86]" aria-hidden="true" />
              <span>Todas as tags deste edital</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {allTagNames.map((tagName) => (
                <div
                  key={tagName}
                  className="px-3 py-2 rounded-lg bg-[#E6F4F5] border border-[#CBE5E8] text-[#09585F] text-xs font-semibold text-center truncate"
                >
                  {tagName}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 bg-white border-t border-[#DCE6E8] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => toggleSaveEdital(edital.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
              saved
                ? "bg-[#FFF6D6] border-[#FFB800] text-[#7A5400]"
                : "bg-white border-[#DCE6E8] text-[#102A30] hover:bg-[#F0F6F7]"
            }`}
          >
            <Bookmark size={16} className={saved ? "fill-[#FFB800] text-[#7A5400]" : ""} />
            <span>{saved ? "Salvo nos seus editais" : "Salvar edital"}</span>
          </button>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={closeEditalModal}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#4A656B] hover:bg-[#F0F6F7] transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0E7C86] hover:bg-[#0B656D] text-white text-sm font-bold transition-colors whitespace-nowrap"
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
