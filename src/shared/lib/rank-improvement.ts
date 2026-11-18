import type { RankFactor } from "@/shared/lib/artistrank";

export interface ImprovementLink {
  href: string;
  label: string;
}

// Cada fator aponta para a tela em que o artista preenche aquele dado (mapa de telas, §2).
const FACTOR_LINKS: Record<string, ImprovementLink> = {
  linguagem: { href: "/configuracoes", label: "Informar suas linguagens" },
  territorio: { href: "/configuracoes", label: "Informar onde você atua" },
  experiencia: { href: "/perfil/trajetoria", label: "Registrar sua trajetória" },
  trajetoria: { href: "/perfil/trajetoria", label: "Registrar sua trajetória" },
  obras: { href: "/perfil/obras", label: "Cadastrar suas obras" },
  completude: { href: "/onboarding", label: "Completar seu perfil" },
  selos: { href: "/perfil", label: "Ver seus selos" },
};

const FALLBACK: ImprovementLink = { href: "/onboarding", label: "Completar seu perfil" };

/** Links sem repetição, na ordem dos fatores que estão sem informação. */
export function improvementLinksFor(missing: readonly RankFactor[]): ImprovementLink[] {
  const seen = new Set<string>();
  const links: ImprovementLink[] = [];
  for (const factor of missing) {
    const link = FACTOR_LINKS[factor.id] ?? FALLBACK;
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    links.push(link);
  }
  return links;
}
