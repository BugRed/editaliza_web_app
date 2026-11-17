import { BookOpen, CalendarDays } from "lucide-react";
import type { IEdital } from "@/app/types/Edital";
import { SafeDate } from "@/app/lib/utils/SafeDate";
import { isEditalClosed } from "@/shared/lib/edital-owner";

const MAX_VISIBLE_TAGS = 3;

interface EditalGalleryCardProps {
  edital: IEdital;
  onOpen: (edital: IEdital) => void;
}

export default function EditalGalleryCard({ edital, onOpen }: EditalGalleryCardProps) {
  const closed = isEditalClosed(edital);
  const tags = Array.isArray(edital.listTags) ? edital.listTags : [];
  const cover = edital.imgCoverUrl && !/exemplo\.com|placeholder/.test(edital.imgCoverUrl) ? edital.imgCoverUrl : "";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-card)">
      <button
        type="button"
        onClick={() => onOpen(edital)}
        aria-label={`Abrir resumo de ${edital.title}`}
        className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden bg-gradient-to-br from-(--primary-soft) via-(--surface-subtle) to-(--accent-soft)"
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-(--primary-fg)">
            <BookOpen size={32} strokeWidth={1.6} aria-hidden="true" />
          </span>
        )}
        <span
          className={`absolute left-3 top-3 rounded-md border px-2 py-1 text-[11px] font-bold shadow-sm ${
            closed ? "border-(--border-subtle) bg-(--bg-card)/95 text-(--text-subtle)" : "border-(--primary-border) bg-(--bg-card)/95 text-(--primary-fg)"
          }`}
        >
          {closed ? "Encerrado" : "Edital aberto"}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="text-[15px] font-bold leading-snug text-(--foreground)">{edital.title}</h4>
        <p className="inline-flex items-center gap-1.5 text-xs text-(--text-muted)">
          <CalendarDays size={13} aria-hidden="true" />
          {edital.endDate ? `Até ${SafeDate(edital.endDate)}` : "Prazo não informado"}
        </p>
        {tags.length > 0 && (
          <ul aria-label="Categorias" className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
              <li key={tag.id ?? tag.name} className="rounded-md border border-(--primary-border) bg-(--primary-soft) px-2 py-0.5 text-[11px] font-semibold text-(--primary-ink)">
                {tag.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
