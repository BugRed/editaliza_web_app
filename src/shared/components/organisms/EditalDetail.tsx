"use client";

import { Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/shared/components/atoms/Badge";
import { Button } from "@/shared/components/atoms/Button";
import { Icon } from "@/shared/components/atoms/Icon";
import { PageHeader } from "@/shared/components/molecules/PageHeader";
import { RejectReasonDialog } from "@/shared/components/organisms/RejectReasonDialog";
import type { EditalDetailData } from "@/shared/lib/profile-view";

type EditalDetailProps = { edital: EditalDetailData; whyHref?: string };

function BulletSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section aria-label={title}>
      <h3 className="font-semibold text-ink">{title}</h3>
      <ul className="mt-1 list-disc pl-5 text-ink-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function EditalDetail({ edital, whyHref }: EditalDetailProps) {
  const [saved, setSaved] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [dismissedReason, setDismissedReason] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title={edital.title}
        description={`${edital.organization} · ${edital.deadlineLabel}`}
        actions={edital.closed ? <Badge tone="danger">Encerrado</Badge> : undefined}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant={saved ? "secondary" : "primary"} aria-pressed={saved} onClick={() => setSaved((value) => !value)}>
          <Icon icon={saved ? BookmarkCheck : Bookmark} />
          {saved ? "Salvo" : "Salvar"}
        </Button>
        <Button variant="secondary" onClick={() => setRejectOpen(true)}>
          Não tenho interesse
        </Button>
        {whyHref && (
          <Link href={whyHref} className="inline-flex h-11 items-center rounded-xl px-5 font-medium text-primary hover:bg-primary-soft">
            Por que este edital?
          </Link>
        )}
      </div>
      {dismissedReason && (
        <p role="status" className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-ink">
          Edital dispensado: {dismissedReason}.
        </p>
      )}
      <div className="flex flex-col gap-5 rounded-xl bg-surface p-6 border border-line">
        <h2 className="text-lg font-semibold text-ink">Resumo em linguagem simples</h2>
        {edital.summary ? (
          <>
            <p className="text-ink">{edital.summary.whatIsIt}</p>
            <BulletSection title="Quem pode participar" items={edital.summary.whoCanApply} />
            <BulletSection title="O que você recebe" items={edital.summary.benefits} />
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {[...edital.tags, ...edital.summary.extraTags].map((tag) => (
                <li key={tag}>
                  <Badge tone="primary">{tag}</Badge>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-ink-muted">O resumo deste edital ainda não está disponível. Leia o texto oficial.</p>
        )}
        <a href={edital.officialLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
          Ler o edital oficial <Icon icon={ExternalLink} size={16} />
        </a>
      </div>
      <RejectReasonDialog
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onConfirm={(reason) => {
          setDismissedReason(reason);
          setRejectOpen(false);
        }}
      />
    </>
  );
}
