interface EditalLike {
  id: number;
  proposer?: { id?: number } | number | null;
  endDate?: Date | string | null;
}

export function getEditalProposerId(edital: Pick<EditalLike, "proposer">): number | null {
  const owner = edital.proposer;
  if (typeof owner === "number") return owner;
  if (owner && typeof owner.id === "number") return owner.id;
  return null;
}

/** Editais de um proponente: pelo dono do edital ou pela lista que o próprio proponente guarda. */
export function filterEditaisByProposer<T extends EditalLike>(
  editais: readonly T[],
  proposerId: number,
  listEdital: readonly number[] = []
): T[] {
  return editais.filter((edital) => getEditalProposerId(edital) === proposerId || listEdital.includes(edital.id));
}

export function isEditalClosed(edital: Pick<EditalLike, "endDate">, now: Date = new Date()): boolean {
  if (!edital.endDate) return false;
  const end = new Date(edital.endDate);
  return !Number.isNaN(end.getTime()) && end.getTime() < now.getTime();
}

/** Página pública da empresa que publicou o edital; vazio quando o edital não tem dono conhecido. */
export function getEditalProposerHref(edital: Pick<EditalLike, "proposer">): string {
  const id = getEditalProposerId(edital);
  return id === null ? "" : `/empresas/${id}`;
}
