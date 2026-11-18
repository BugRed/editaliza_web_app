import type { IngestStatus } from "@/app/lib/admin-editais-fixture";

const LABEL: Record<IngestStatus, string> = {
  PROCESSING: "Processando",
  FAILED: "Falhou",
  REVIEW: "Em revisão",
  PUBLISHED: "Publicado",
};

const STYLE: Record<IngestStatus, string> = {
  PROCESSING: "bg-(--surface-subtle) text-(--text-muted) border-(--border-subtle)",
  FAILED: "bg-(--danger-soft) text-(--danger) border-(--danger-border)",
  REVIEW: "bg-(--accent-soft) text-(--accent-ink) border-(--accent)",
  PUBLISHED: "bg-(--primary-soft) text-(--primary-ink) border-(--primary-border)",
};

export default function StatusBadge({ status }: { status: IngestStatus }) {
  return <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${STYLE[status]}`}>{LABEL[status]}</span>;
}
