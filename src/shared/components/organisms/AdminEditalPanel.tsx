import { Badge } from "@/shared/components/atoms/Badge";
import { Input } from "@/shared/components/atoms/Input";
import { EmptyState } from "@/shared/components/molecules/EmptyState";
import { FormField } from "@/shared/components/molecules/FormField";
import { PageHeader } from "@/shared/components/molecules/PageHeader";
import type { AdminEdital, AdminEditalStatus, Requirement } from "@/shared/lib/profile-view";

const STATUS_LABEL: Record<AdminEditalStatus, string> = {
  processando: "Processando",
  revisao: "Aguardando revisão",
  falha: "Falha na extração",
  publicado: "Publicado",
};

const STATUS_TONE: Record<AdminEditalStatus, "neutral" | "accent" | "danger" | "primary"> = {
  processando: "neutral",
  revisao: "accent",
  falha: "danger",
  publicado: "primary",
};

type AdminEditalPanelProps = { editais: AdminEdital[]; requirements: Requirement[] };

export function AdminEditalPanel({ editais, requirements }: AdminEditalPanelProps) {
  return (
    <>
      <PageHeader title="Editais (admin)" description="Envie o PDF, revise os requisitos extraídos e publique." />
      <section className="rounded-lg bg-surface p-6 shadow-card" aria-label="Enviar edital">
        <FormField label="PDF do edital" hint="Só arquivos PDF.">
          {(control) => <Input {...control} type="file" accept="application/pdf" className="py-2" />}
        </FormField>
      </section>
      {editais.length === 0 ? (
        <EmptyState title="Nenhum edital enviado" />
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Editais enviados">
          {editais.map((edital) => (
            <li key={edital.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface p-4 shadow-card">
              <div>
                <p className="font-medium text-ink">{edital.title}</p>
                {edital.note && <p className="text-sm text-danger">{edital.note}</p>}
              </div>
              <Badge tone={STATUS_TONE[edital.status]}>{STATUS_LABEL[edital.status]}</Badge>
            </li>
          ))}
        </ul>
      )}
      <section aria-label="Requisitos extraídos" className="rounded-lg bg-surface p-6 shadow-card">
        <h2 className="font-semibold text-ink">Requisitos extraídos para revisão</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {requirements.map((requirement) => (
            <li key={requirement.text} className="flex flex-col gap-1 border-b border-line-subtle pb-3 last:border-0">
              <div className="flex items-center gap-2">
                <Badge tone={requirement.kind === "CORE" ? "primary" : "neutral"}>{requirement.kind}</Badge>
                <span className="text-ink">{requirement.text}</span>
              </div>
              <blockquote className="text-sm text-ink-muted">“{requirement.evidence}”</blockquote>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
