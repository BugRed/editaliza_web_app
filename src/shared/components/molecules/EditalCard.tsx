"use client";

import { Bookmark, BookOpen, CalendarDays, FileText, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { joinClassNames } from "@/shared/lib/cn";

type EditalCardProps = {
  title: string;
  organization: string;
  dateLabel: string;
  description?: string;
  coverImage?: string;
  statusLabel?: string;
  tags: string[];
  /** Página de detalhe interna; quando ausente o título é texto. */
  detailHref?: string;
  /** Link de inscrição (externo). */
  submitHref?: string;
};

const DESCRIPTION_LIMIT = 140;
const PLACEHOLDER_COVER = /exemplo\.com|placeholder/;

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Cover({ src, title }: { src?: string; title: string }) {
  const [failed, setFailed] = useState(!src || PLACEHOLDER_COVER.test(src));
  if (failed || !src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center border-y border-line bg-gradient-to-br from-primary-soft via-surface-subtle to-accent-soft p-6">
        <div className="flex max-w-sm flex-col items-center gap-2.5 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen size={24} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-bold leading-snug text-primary-ink">{title}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="aspect-video w-full overflow-hidden border-y border-line bg-surface-subtle">
      {/* eslint-disable-next-line @next/next/no-img-element -- capas vêm de origens arbitrárias; next/image exigiria domínios fixos */}
      <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="size-full object-cover" />
    </div>
  );
}

function ActionButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-1.5 text-ink-muted transition-colors hover:bg-surface-subtle hover:text-primary"
    >
      {children}
    </button>
  );
}

// Sem score: a UI não mostra compatibilidade até o motor existir (O4).
export function EditalCard({ title, organization, dateLabel, description, coverImage, statusLabel, tags, detailHref, submitHref }: EditalCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sem permissão de área de transferência: nada a fazer, o usuário copia pela barra.
    }
  }

  return (
    <article className="border-b border-line bg-surface">
      <div className="flex items-center gap-3 px-5 py-3.5">
        <div
          aria-hidden="true"
          className="flex size-[2.375rem] shrink-0 items-center justify-center rounded-pill border border-line-strong bg-primary-soft text-[0.8125rem] font-bold text-primary"
        >
          {getInitials(organization)}
        </div>
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="truncate font-medium text-ink">{organization}</span>
          <span aria-hidden="true" className="text-ink-subtle">·</span>
          <span className="flex items-center gap-1 whitespace-nowrap text-ink-muted">
            <CalendarDays size={13} aria-hidden="true" />
            {dateLabel}
          </span>
        </div>
      </div>
      <div className="relative">
        <Cover src={coverImage} title={title} />
        {statusLabel && (
          <span className="absolute left-3.5 top-3.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-bold text-primary shadow-card">
            {statusLabel}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 px-5 pb-[1.125rem] pt-4">
        <h2 className="text-lg font-bold leading-snug text-ink [text-wrap:balance]">
          {detailHref ? (
            <Link href={detailHref} className="hover:text-primary">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        {description && (
          <div className="flex flex-col items-start gap-1.5">
            <p className={joinClassNames("text-[0.9375rem] leading-relaxed text-ink-muted", !expanded && "line-clamp-3")}>{description}</p>
            {description.length > DESCRIPTION_LIMIT && (
              <button type="button" onClick={() => setExpanded((value) => !value)} className="text-[0.8125rem] font-bold text-primary hover:underline">
                {expanded ? "Ler menos" : "Continuar lendo"}
              </button>
            )}
          </div>
        )}
        {tags.length > 0 && (
          <ul aria-label="Tags" className="flex flex-wrap items-center gap-x-2 text-[0.8125rem] font-semibold tracking-[0.01em] text-primary-ink">
            {tags.map((tag, index) => (
              <li key={tag} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true" className="text-ink-subtle">·</span>}
                {tag}
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <ActionButton label={liked ? "Remover curtida" : "Curtir edital"} pressed={liked} onClick={() => setLiked((value) => !value)}>
              <Heart size={19} className={liked ? "fill-danger text-danger" : undefined} aria-hidden="true" />
            </ActionButton>
            <ActionButton label={saved ? "Remover dos salvos" : "Salvar edital"} pressed={saved} onClick={() => setSaved((value) => !value)}>
              <Bookmark size={19} className={saved ? "fill-primary text-primary" : undefined} aria-hidden="true" />
            </ActionButton>
            <ActionButton label="Compartilhar edital" onClick={handleShare}>
              <Share2 size={19} aria-hidden="true" />
            </ActionButton>
            {copied && (
              <span role="status" className="text-xs text-ink-muted">
                Link copiado
              </span>
            )}
          </div>
          {submitHref && (
            <a
              href={submitHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-[0.45rem] whitespace-nowrap rounded-lg bg-primary px-[1.125rem] py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover active:translate-y-px"
            >
              Inscrever-se
              <FileText size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
