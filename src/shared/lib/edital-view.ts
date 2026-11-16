import type { IEdital } from "@/app/types/Edital";

export type EditalCardData = {
  id: number;
  title: string;
  organization: string;
  deadlineLabel: string;
  description?: string;
  coverImage?: string;
  statusLabel?: string;
  submitHref?: string;
  tags: string[];
};

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

// O JSON da API entrega datas como string; aceita as duas formas.
function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDeadline(endDate: Date | string | null | undefined, now: Date = new Date()): string {
  const date = toDate(endDate);
  if (!date) return "Prazo não informado";
  const label = DATE_FORMAT.format(date);
  return date.getTime() < now.getTime() ? `Encerrado em ${label}` : `Inscrições até ${label}`;
}

export function toEditalCardData(edital: IEdital, now: Date = new Date()): EditalCardData {
  const end = toDate(edital.endDate);
  return {
    id: edital.id,
    title: edital.title,
    organization: edital.proposer?.name ?? "Organização não informada",
    deadlineLabel: formatDeadline(edital.endDate, now),
    description: edital.description || undefined,
    coverImage: edital.imgCoverUrl || undefined,
    statusLabel: end && end.getTime() < now.getTime() ? "Encerrado" : "Edital aberto",
    submitHref: edital.inscriptionLink || edital.completeEditalLink || undefined,
    tags: (edital.listTags ?? []).map((tag) => tag.name),
  };
}

export function filterEditalCards(cards: EditalCardData[], query: string): EditalCardData[] {
  const term = query.trim().toLocaleLowerCase("pt-BR");
  if (!term) return cards;
  return cards.filter((card) =>
    [card.title, card.organization, ...card.tags].some((text) => text.toLocaleLowerCase("pt-BR").includes(term)),
  );
}
