import { Camera, Image as ImageIcon, Music, Play, Type, Shapes } from "lucide-react";
import type { ArtWork } from "@/app/lib/user-profiles";
import { WORK_KIND_LABELS, type WorkKind } from "@/shared/lib/media";

const KIND_ICON: Record<WorkKind, typeof ImageIcon> = {
  IMAGEM: ImageIcon,
  FOTOGRAFIA: Camera,
  VIDEO: Play,
  AUDIO: Music,
  TEXTO: Type,
  OUTRO: Shapes,
};

const MAX_VISIBLE_TAGS = 3;

interface WorkCardProps {
  work: ArtWork;
  onOpen: (work: ArtWork) => void;
}

export default function WorkCard({ work, onOpen }: WorkCardProps) {
  const kind: WorkKind = work.kind ?? "IMAGEM";
  const KindIcon = KIND_ICON[kind];
  const tags = work.tags ?? [];
  const extraTags = tags.length - MAX_VISIBLE_TAGS;
  const specs = [work.technique, work.dimensions].filter(Boolean);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-card)">
      <button
        type="button"
        onClick={() => onOpen(work)}
        aria-label={`Abrir ${work.title}`}
        className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-(--surface-subtle)"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={work.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md border border-(--border-subtle) bg-(--bg-card)/95 px-2 py-1 text-[11px] font-bold text-(--primary-ink) shadow-sm">
          <KindIcon size={12} aria-hidden="true" />
          {WORK_KIND_LABELS[kind]}
        </span>
        {(kind === "VIDEO" || kind === "AUDIO") && (
          <span className="absolute inset-0 flex items-center justify-center bg-(--scrim)/20">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-card)/95 text-(--primary-fg) shadow-md">
              {kind === "VIDEO" ? <Play size={20} fill="currentColor" aria-hidden="true" /> : <Music size={20} aria-hidden="true" />}
            </span>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-[15px] font-bold leading-snug text-(--foreground)">{work.title}</h4>
          <span className="shrink-0 rounded-md bg-(--surface-subtle) px-2 py-0.5 text-xs font-bold tabular-nums text-(--text-muted)">{work.year}</span>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-(--primary-fg)">{work.category}</p>

        {specs.length > 0 && (
          <dl className="space-y-0.5 text-xs text-(--text-muted)">
            {work.technique && (
              <div className="flex gap-1.5">
                <dt className="font-bold text-(--text-subtle)">Técnica</dt>
                <dd>{work.technique}</dd>
              </div>
            )}
            {work.dimensions && (
              <div className="flex gap-1.5">
                <dt className="font-bold text-(--text-subtle)">Dimensões</dt>
                <dd>{work.dimensions}</dd>
              </div>
            )}
          </dl>
        )}

        {work.description && <p className="line-clamp-2 text-sm leading-relaxed text-(--text-muted)">{work.description}</p>}

        {tags.length > 0 && (
          <ul aria-label="Temas da obra" className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
              <li key={tag} className="rounded-md border border-(--primary-border) bg-(--primary-soft) px-2 py-0.5 text-[11px] font-semibold text-(--primary-ink)">
                {tag}
              </li>
            ))}
            {extraTags > 0 && (
              <li className="rounded-md bg-(--surface-subtle) px-2 py-0.5 text-[11px] font-semibold text-(--text-subtle)">+{extraTags}</li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}
