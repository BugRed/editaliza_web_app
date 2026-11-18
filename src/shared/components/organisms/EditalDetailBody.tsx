import { CalendarDays, CheckCircle2, Sparkles, Tag, Users } from "lucide-react";
import { collectEditalTags, resolveEditalSummary } from "@/app/lib/edital-detail";
import { SafeDate } from "@/app/lib/utils/SafeDate";
import type { IEdital } from "@/app/types/Edital";

/** Resumo em linguagem simples, quem pode participar, o que recebe, datas e tags. Serve ao modal e à página. */
export default function EditalDetailBody({ edital }: { edital: IEdital }) {
  const { summary } = resolveEditalSummary(edital);
  const allTagNames = collectEditalTags(edital, summary);

  return (
    <>

      {/* O que é */}
      <section className="bg-(--background) border border-(--border-subtle) rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-(--primary-fg) mb-2">
          <Sparkles size={16} aria-hidden="true" />
          <span>O que é este edital na prática?</span>
        </div>
        <p className="text-[15px] text-(--foreground) leading-relaxed">
          {summary.whatIsIt}
        </p>
      </section>

      {/* 2-column structured details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="border border-(--border-subtle) rounded-xl p-4 bg-(--bg-card)">
          <div className="flex items-center gap-2 text-sm font-bold text-(--foreground) mb-2.5">
            <Users size={16} className="text-(--primary-fg)" aria-hidden="true" />
            <span>Quem pode participar</span>
          </div>
          <ul className="space-y-2 text-sm text-(--text-muted) leading-relaxed">
            {summary.whoCanApply.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-(--primary) shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-(--border-subtle) rounded-xl p-4 bg-(--bg-card)">
          <div className="flex items-center gap-2 text-sm font-bold text-(--foreground) mb-2.5">
            <CheckCircle2 size={16} className="text-(--primary-fg)" aria-hidden="true" />
            <span>O que você recebe</span>
          </div>
          <ul className="space-y-2 text-sm text-(--text-muted) leading-relaxed">
            {summary.benefits.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-(--accent) shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Dates grid */}
      <section className="grid grid-cols-2 gap-4 border border-(--border-subtle) rounded-xl p-4 bg-(--background)">
        <div>
          <span className="text-xs font-medium text-(--text-subtle) block">
            Publicado em
          </span>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-(--foreground) tabular-nums">
            <CalendarDays size={15} className="text-(--primary-fg)" aria-hidden="true" />
            {SafeDate(edital.publishDate)}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-(--text-subtle) block">
            Prazo de inscrição
          </span>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-(--foreground) tabular-nums">
            <CalendarDays size={15} className="text-(--warning)" aria-hidden="true" />
            {edital.endDate ? SafeDate(edital.endDate) : "Fluxo contínuo"}
          </span>
        </div>
      </section>

      {/* All tags well distributed */}
      <section>
        <div className="flex items-center gap-2 text-sm font-bold text-(--foreground) mb-3">
          <Tag size={15} className="text-(--primary-fg)" aria-hidden="true" />
          <span>Todas as tags deste edital</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {allTagNames.map((tagName) => (
            <div
              key={tagName}
              className="px-3 py-2 rounded-lg bg-(--primary-soft) border border-(--primary-border) text-(--primary-ink) text-xs font-semibold text-center truncate"
            >
              {tagName}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
