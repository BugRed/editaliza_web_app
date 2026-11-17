// Anúncios de exemplo. Ainda não há rede de anúncios: o formato do contrato é este, e trocar a
// fonte por uma API não muda os componentes. Marcas e textos são fictícios.
export interface AdCreative {
  id: string;
  brand: string;
  headline: string;
  text: string;
  cta: string;
  href: string;
  imageUrl: string;
}

export const AD_CREATIVES: AdCreative[] = [
  {
    id: "ad-tintas",
    brand: "Ateliê Cor & Pigmento",
    headline: "Tintas minerais para artistas",
    text: "Pigmentos, telas e pincéis com 15% de desconto para membros do Editaliza.",
    cta: "Ver ofertas",
    href: "https://exemplo.com.br/tintas",
    imageUrl: "/images/art_pintura_tela_1794791580838.jpg",
  },
  {
    id: "ad-curso",
    brand: "Escola Palco Aberto",
    headline: "Curso de escrita de projetos culturais",
    text: "Aprenda a montar a documentação que os editais pedem. Turma online com vagas abertas.",
    cta: "Quero saber mais",
    href: "https://exemplo.com.br/curso",
    imageUrl: "/images/art_teatro_palco_1794791582532.jpg",
  },
  {
    id: "ad-galeria",
    brand: "Galeria Maré",
    headline: "Chamada para exposição coletiva",
    text: "Espaço expositivo no centro de Recife recebe portfólios de artistas visuais.",
    cta: "Enviar portfólio",
    href: "https://exemplo.com.br/galeria",
    imageUrl: "/images/art_escultura_galeria_1794791581583.jpg",
  },
];

/** Escolha determinística (sem sorteio): evita diferença entre servidor e cliente e é testável. */
export function pickAd(slot: number, ads: AdCreative[] = AD_CREATIVES): AdCreative | null {
  if (ads.length === 0) return null;
  const index = ((slot % ads.length) + ads.length) % ads.length;
  return ads[index];
}

/** Índices (0-based) depois dos quais entra um anúncio no feed: a cada `every` posts. */
export function adPositions(totalPosts: number, every: number): number[] {
  if (every < 1) return [];
  const positions: number[] = [];
  for (let after = every - 1; after < totalPosts - 1; after += every) positions.push(after);
  return positions;
}
