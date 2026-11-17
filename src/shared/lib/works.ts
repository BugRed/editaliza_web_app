import { WORK_KINDS, type WorkKind } from "@/shared/lib/media";

export type WorkFilter = "TODAS" | "IMAGEM" | "VIDEO" | "AUDIO";

/** Imagem e fotografia ficam juntas na aba "Imagens": para quem navega são o mesmo tipo de contemplação. */
const FILTER_KINDS: Record<Exclude<WorkFilter, "TODAS">, WorkKind[]> = {
  IMAGEM: ["IMAGEM", "FOTOGRAFIA"],
  VIDEO: ["VIDEO"],
  AUDIO: ["AUDIO"],
};

export function filterWorks<T extends { kind?: WorkKind }>(works: readonly T[], filter: WorkFilter): T[] {
  if (filter === "TODAS") return [...works];
  const allowed = FILTER_KINDS[filter];
  return works.filter((work) => allowed.includes(work.kind ?? "IMAGEM"));
}

export function countByFilter<T extends { kind?: WorkKind }>(works: readonly T[]): Record<WorkFilter, number> {
  return {
    TODAS: works.length,
    IMAGEM: filterWorks(works, "IMAGEM").length,
    VIDEO: filterWorks(works, "VIDEO").length,
    AUDIO: filterWorks(works, "AUDIO").length,
  };
}

export { WORK_KINDS };

const MAX_TAGS = 12;

/** "retrato, memória , retrato" → ["retrato", "memória"]: sem vazios, sem repetição, com teto. */
export function parseTagList(text: string): string[] {
  const seen = new Set<string>();
  for (const part of text.split(",")) {
    const tag = part.trim();
    if (tag) seen.add(tag);
  }
  return [...seen].slice(0, MAX_TAGS);
}
