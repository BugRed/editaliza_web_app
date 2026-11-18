import { pickAd } from "@/app/lib/ads";

type AdSlotProps = {
  /** rail: coluna da direita · sidebar: menu lateral · feed: entre posts. */
  variant: "rail" | "sidebar" | "feed";
  /** Número do espaço, para variar o criativo entre vários na mesma tela. */
  slot?: number;
};

function Label() {
  return (
    <span className="inline-flex items-center rounded-md border border-(--border-subtle) bg-(--bg-card) px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-(--text-subtle)">
      Publicidade
    </span>
  );
}

const LINK_REL = "sponsored noopener noreferrer";

export default function AdSlot({ variant, slot = 0 }: AdSlotProps) {
  const ad = pickAd(slot);
  if (!ad) return null;

  if (variant === "feed") {
    return (
      <aside aria-label="Publicidade" className="border-b border-(--border-subtle) bg-(--background) px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <Label />
          <span className="text-xs text-(--text-subtle)">{ad.brand}</span>
        </div>
        <a href={ad.href} target="_blank" rel={LINK_REL} className="group block overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-card)">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.imageUrl} alt="" className="aspect-[21/9] w-full object-cover" />
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-base font-bold leading-snug text-(--foreground)">{ad.headline}</p>
              <p className="mt-0.5 text-sm text-(--text-muted)">{ad.text}</p>
            </div>
            <span className="shrink-0 rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-white group-hover:bg-(--primary-hover)">
              {ad.cta}
            </span>
          </div>
        </a>
      </aside>
    );
  }

  if (variant === "rail") {
    return (
      <aside aria-label="Publicidade" className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-card)">
        <a href={ad.href} target="_blank" rel={LINK_REL} className="group block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <Label />
              <span className="truncate text-xs text-(--text-subtle)">{ad.brand}</span>
            </div>
            <p className="text-base font-bold leading-snug text-(--foreground)">{ad.headline}</p>
            <p className="text-sm leading-relaxed text-(--text-muted)">{ad.text}</p>
            <span className="mt-1 inline-flex rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-(--primary-hover)">
              {ad.cta}
            </span>
          </div>
        </a>
      </aside>
    );
  }

  // sidebar: preenche a altura que o menu lateral deixar livre; a imagem cresce, o texto não.
  return (
    <aside aria-label="Publicidade" className="flex h-full min-h-48 flex-col overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-card)">
      <a href={ad.href} target="_blank" rel={LINK_REL} className="group flex min-h-0 flex-1 flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ad.imageUrl} alt="" className="min-h-0 w-full flex-1 object-cover" />
        <div className="shrink-0 space-y-1.5 p-3">
          <Label />
          <p className="text-[13px] font-bold leading-snug text-(--foreground)">{ad.headline}</p>
          <p className="text-xs text-(--text-subtle)">{ad.brand}</p>
          <span className="inline-block pt-0.5 text-xs font-bold text-(--primary-fg) group-hover:underline">{ad.cta} →</span>
        </div>
      </a>
    </aside>
  );
}
