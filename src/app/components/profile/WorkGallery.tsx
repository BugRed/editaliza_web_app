"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ArtWork } from "@/app/lib/user-profiles";
import { isPlayableKind, WORK_KIND_LABELS } from "@/shared/lib/media";
import { countByFilter, filterWorks, type WorkFilter } from "@/shared/lib/works";
import MediaPlayer from "./MediaPlayer";
import WorkCard from "./WorkCard";

const TABS: Array<{ id: WorkFilter; label: string }> = [
  { id: "TODAS", label: "Todas" },
  { id: "IMAGEM", label: "Imagens" },
  { id: "VIDEO", label: "Vídeos" },
  { id: "AUDIO", label: "Áudios" },
];

interface WorkGalleryProps {
  works: ArtWork[];
}

// A ordem vem do perfil: quem reordena em Configurações reordena aqui.
export default function WorkGallery({ works }: WorkGalleryProps) {
  const [filter, setFilter] = useState<WorkFilter>("TODAS");
  const [selected, setSelected] = useState<ArtWork | null>(null);
  const counts = countByFilter(works);
  const visible = filterWorks(works, filter);

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  const kind = selected?.kind ?? "IMAGEM";

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Tipo de obra" className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.id)}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                active ? "border-(--primary-fg) bg-(--primary) text-white" : "border-(--border-subtle) bg-(--bg-card) text-(--text-muted) hover:bg-(--surface-subtle)"
              }`}
            >
              {tab.label} <span className="tabular-nums opacity-80">{counts[tab.id]}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--border-subtle) p-8 text-center text-sm text-(--text-subtle)">
          Nenhuma obra neste tipo ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((work) => (
            <WorkCard key={work.id} work={work} onOpen={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim)/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-(--border-subtle) bg-(--bg-card) shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative bg-(--surface-subtle)">
              {isPlayableKind(kind) ? (
                <div className="p-3">
                  <MediaPlayer url={selected.mediaUrl ?? ""} title={selected.title} poster={selected.imageUrl} />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.imageUrl} alt={selected.title} className="max-h-[60vh] w-full object-contain" />
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Fechar visualização da obra"
                className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-(--bg-card)/90 text-(--foreground) shadow-sm hover:bg-(--bg-card)"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-lg font-bold leading-snug text-(--foreground)">{selected.title}</h4>
                <span className="shrink-0 text-xs font-bold tabular-nums text-(--primary-fg)">{selected.year}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-(--primary-fg)">
                {WORK_KIND_LABELS[kind]} · {selected.category}
              </p>
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {selected.technique && (
                  <div>
                    <dt className="text-xs font-bold text-(--text-subtle)">Técnica</dt>
                    <dd className="text-(--foreground)">{selected.technique}</dd>
                  </div>
                )}
                {selected.dimensions && (
                  <div>
                    <dt className="text-xs font-bold text-(--text-subtle)">Dimensões</dt>
                    <dd className="text-(--foreground)">{selected.dimensions}</dd>
                  </div>
                )}
              </dl>
              <p className="text-sm leading-relaxed text-(--text-muted)">{selected.description}</p>
              {(selected.tags?.length ?? 0) > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Temas da obra">
                  {selected.tags?.map((tag) => (
                    <li key={tag} className="rounded-md border border-(--primary-border) bg-(--primary-soft) px-2 py-0.5 text-xs font-semibold text-(--primary-ink)">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
