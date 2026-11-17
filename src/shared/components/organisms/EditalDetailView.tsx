import Link from "next/link";
import { AlertTriangle, Bookmark, ExternalLink, Info } from "lucide-react";
import { buildRequirementRows, resolveEditalSummary, resolveExternalUrl, type RequirementStrength } from "@/app/lib/edital-detail";
import type { IEdital } from "@/app/types/Edital";
import { isEditalClosed } from "@/shared/lib/edital-owner";
import EditalDetailBody from "@/shared/components/organisms/EditalDetailBody";

interface EditalDetailViewProps {
  edital: IEdital;
  proposerName: string;
  proposerHref: string;
  saved: boolean;
  onToggleSave: () => void;
}

const STRENGTH_LABEL: Record<RequirementStrength, string> = {
  obrigatorio: "Obrigatório",
  aceito: "Aceito",
  preferencia: "Preferência",
};

const STRENGTH_STYLE: Record<RequirementStrength, string> = {
  obrigatorio: "bg-(--danger-soft) text-(--danger) border-(--danger-border)",
  aceito: "bg-(--primary-soft) text-(--primary-ink) border-(--primary-border)",
  preferencia: "bg-(--surface-subtle) text-(--text-muted) border-(--border-subtle)",
};

export default function EditalDetailView({ edital, proposerName, proposerHref, saved, onToggleSave }: EditalDetailViewProps) {
  const closed = isEditalClosed(edital);
  const { provisional } = resolveEditalSummary(edital);
  const requirements = buildRequirementRows(edital);

  return (
    <article className="space-y-5 p-5 sm:p-6">
      {edital.imgCoverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={edital.imgCoverUrl} alt="" className="w-full aspect-[16/9] object-cover rounded-xl border border-(--border-subtle)" />
      )}

      <header className="space-y-1">
        <h2 className="text-2xl font-bold text-(--foreground) leading-snug">{edital.title}</h2>
        <p className="text-sm text-(--text-muted)">
          Organizado por{" "}
          {proposerHref ? (
            <Link href={proposerHref} className="font-medium text-(--primary-fg) hover:underline">
              {proposerName}
            </Link>
          ) : (
            <span className="font-medium text-(--foreground)">{proposerName}</span>
          )}
        </p>
      </header>

      {closed && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-(--danger-border) bg-(--danger-soft) px-4 py-3 text-sm text-(--danger)">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          Inscrições encerradas. Você ainda pode ler o edital e salvá-lo para consulta.
        </p>
      )}

      {provisional && (
        <p role="note" className="flex items-start gap-2 rounded-xl border border-(--accent) bg-(--accent-soft) px-4 py-3 text-sm text-(--accent-ink)">
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          Resumo provisório: este edital ainda não passou pela revisão. Confira os detalhes no documento oficial.
        </p>
      )}

      <EditalDetailBody edital={edital} />

      <section aria-labelledby="requisitos-titulo" className="rounded-xl border border-(--border-subtle) bg-(--bg-card) p-4 sm:p-5">
        <h3 id="requisitos-titulo" className="text-sm font-bold text-(--foreground) mb-3">
          Requisitos do edital
        </h3>
        {requirements.length === 0 ? (
          <p className="text-sm text-(--text-muted)">Este edital ainda não tem requisitos estruturados. Veja o documento oficial.</p>
        ) : (
          <ul className="divide-y divide-(--border-subtle)">
            {requirements.map((row) => (
              <li key={row.label} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <span className="text-(--text-muted)">{row.label}</span>
                <span className="flex items-center gap-2 text-right">
                  <span className="font-medium text-(--foreground)">{row.value}</span>
                  <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${STRENGTH_STYLE[row.strength]}`}>
                    {STRENGTH_LABEL[row.strength]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--border-subtle) pt-4">
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
            saved
              ? "bg-(--accent-soft) border-(--accent) text-(--accent-ink)"
              : "bg-(--bg-card) border-(--border-subtle) text-(--foreground) hover:bg-(--surface-subtle)"
          }`}
        >
          <Bookmark size={16} className={saved ? "fill-(--accent) text-(--accent-ink)" : ""} />
          <span>{saved ? "Salvo nos seus editais" : "Salvar edital"}</span>
        </button>
        <Link href={`/editais/${edital.id}/porque`} className="text-sm font-semibold text-(--primary-fg) hover:underline">
          Por que essa nota?
        </Link>
        <a
          href={resolveExternalUrl(edital)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--primary) hover:bg-(--primary-hover) text-white text-sm font-bold transition-colors whitespace-nowrap"
        >
          <span>Ir para o edital</span>
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
