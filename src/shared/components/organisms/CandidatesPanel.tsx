import Link from "next/link";
import { splitCandidates, type Candidate } from "@/shared/lib/candidates";

const ELIGIBILITY_LABEL = { PASS: "Elegível", UNKNOWN: "Elegibilidade pendente" } as const;

export default function CandidatesPanel({ editalTitle, candidates }: { editalTitle: string; candidates: Candidate[] }) {
  const { visible, hiddenCount } = splitCandidates(candidates);

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <p role="note" className="rounded-xl bg-(--accent-soft) border border-(--accent) px-4 py-3 text-sm text-(--accent-ink)">
        Prévia com dados fixos. Aqui só aparecem artistas que aceitaram compartilhar o perfil com organizações, e nunca a nota deles.
      </p>

      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-(--primary-fg)">Artistas compatíveis</p>
        <h2 className="text-xl font-bold text-(--foreground)">{editalTitle}</h2>
      </header>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--border-subtle) p-6 text-center text-sm text-(--text-muted)">
          Nenhum artista compatível compartilhou o perfil com você até agora.
        </p>
      ) : (
        <ul aria-label="Candidatos" className="divide-y divide-(--border-subtle) rounded-xl border border-(--border-subtle) bg-(--bg-card)">
          {visible.map((candidate) => (
            <li key={candidate.id} className="flex items-center gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={candidate.avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover border border-(--border-subtle)" />
              <div className="min-w-0 flex-1">
                <Link href={`/artistas/${candidate.id}`} className="block truncate text-sm font-bold text-(--foreground) hover:underline">
                  {candidate.name}
                </Link>
                <p className="truncate text-xs text-(--text-subtle)">
                  {candidate.handle} · {candidate.city} · {candidate.languages.join(", ")}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                  candidate.eligibility === "PASS" ? "border-(--primary-border) bg-(--primary-soft) text-(--primary-ink)" : "border-(--border-subtle) bg-(--surface-subtle) text-(--text-muted)"
                }`}
              >
                {ELIGIBILITY_LABEL[candidate.eligibility]}
              </span>
            </li>
          ))}
        </ul>
      )}

      {hiddenCount > 0 && (
        <p role="status" className="text-sm text-(--text-muted)">
          Mais {hiddenCount} {hiddenCount === 1 ? "artista compatível não compartilhou" : "artistas compatíveis não compartilharam"} o perfil e{" "}
          {hiddenCount === 1 ? "não aparece" : "não aparecem"} aqui.
        </p>
      )}
    </div>
  );
}
