import { ProfileLevel, RankArtistInput, TerritoryScope } from "@/shared/lib/artistrank";
import { isWorkKind, type WorkKind } from "@/shared/lib/media";

export interface UserBadge {
  id: string;
  title: string;
  editalName: string;
  year: string;
  category: string;
  /** Edital que concedeu o selo (leva ao resumo dele). */
  editalId?: number;
  /** Proponente que concedeu o selo (leva ao perfil da empresa). */
  issuerId?: number;
  issuerName?: string;
}

export interface ArtWork {
  id: string;
  title: string;
  /** Linguagem artística (Pintura, Música…), a mesma usada no ranking. */
  category: string;
  year: string;
  /** Texto curto que define a obra. */
  description: string;
  /** Capa. Em vídeo e áudio é o pôster. */
  imageUrl: string;
  /** Formato da obra. Ausente em obras antigas: vale IMAGEM. */
  kind?: WorkKind;
  technique?: string;
  dimensions?: string;
  /** Temas e assuntos que a obra abrange. */
  tags?: string[];
  /** Arquivo ou link tocável (vídeo/áudio). */
  mediaUrl?: string;
}

export function normalizeWork(raw: ArtWork): ArtWork {
  return {
    ...raw,
    kind: isWorkKind(raw.kind) ? raw.kind : "IMAGEM",
    technique: raw.technique ?? "",
    dimensions: raw.dimensions ?? "",
    tags: Array.isArray(raw.tags) ? raw.tags.filter((tag) => typeof tag === "string" && tag.trim()) : [],
    mediaUrl: raw.mediaUrl ?? "",
  };
}

export interface ArtistProfile {
  id: number;
  name: string;
  handle: string;
  email: string;
  city: string;
  state: string;
  territoryScope: TerritoryScope;
  bio: string;
  avatarUrl: string;
  tags: string[]; // União de coreLanguages + supportLanguages para exibição
  coreLanguages: string[]; // Peso 1.0 no ArtistRank
  supportLanguages: string[]; // Peso 0.65 no ArtistRank
  experienceYears: number;
  profileLevel: ProfileLevel;
  hasCnpjOrMei: boolean;
  hasTechnicalFormation: boolean;
  portfolioCompleteness: number;
  badges: UserBadge[];
  works: ArtWork[];
  savedEditalIds?: number[];
  likedEditalIds?: number[];
}

export const ALL_ART_TAGS = [
  "Pintura",
  "Teatro",
  "Música",
  "Escultura",
  "Performance",
  "Fotografia",
  "Dança",
  "Literatura",
];

export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export function calculatePortfolioCompleteness(
  profile: Partial<ArtistProfile>
): number {
  let score = 15;
  if (profile.bio && profile.bio.trim().length >= 15) score += 15;
  if (profile.city && profile.city.trim().length >= 2) score += 8;
  if (profile.state && profile.state.trim().length >= 2) score += 7;
  if ((profile.coreLanguages?.length ?? 0) > 0) score += 15;
  if ((profile.supportLanguages?.length ?? 0) > 0) score += 5;

  const worksCount = profile.works?.length ?? 0;
  if (worksCount >= 3) score += 25;
  else if (worksCount === 2) score += 18;
  else if (worksCount === 1) score += 10;

  if ((profile.badges?.length ?? 0) > 0) score += 10;

  return Math.max(20, Math.min(100, score));
}

export function normalizeArtistRow(
  row: Record<string, unknown>,
  fallback?: ArtistProfile
): ArtistProfile {
  const rawListTags = parseJsonField<Array<{ name?: string } | string>>(
    row.listTags,
    []
  );
  const tagNamesFromList = rawListTags
    .map((t) => (typeof t === "string" ? t : t?.name || ""))
    .filter(Boolean);

  const coreLanguages = parseJsonField<string[]>(
    row.coreLanguages,
    fallback?.coreLanguages ?? tagNamesFromList.slice(0, 2)
  );
  const supportLanguages = parseJsonField<string[]>(
    row.supportLanguages,
    fallback?.supportLanguages ?? []
  );

  const mergedTags = Array.from(
    new Set([...coreLanguages, ...supportLanguages, ...tagNamesFromList])
  ).filter(Boolean);

  const badges = parseJsonField<UserBadge[]>(row.badges, fallback?.badges ?? []);
  const works = parseJsonField<ArtWork[]>(row.works, fallback?.works ?? []).map(normalizeWork);
  const savedEditalIds = parseJsonField<number[]>(
    row.savedEditalIds,
    fallback?.savedEditalIds ?? []
  );
  const likedEditalIds = parseJsonField<number[]>(
    row.likedEditalIds,
    fallback?.likedEditalIds ?? []
  );

  const avatarUrl =
    (typeof row.avatarUrl === "string" && row.avatarUrl) ||
    (typeof row.imgUrl === "string" && row.imgUrl) ||
    fallback?.avatarUrl ||
    "/images/avatar_joao_1794791579584.jpg";

  const baseProfile: ArtistProfile = {
    id: Number(row.id ?? fallback?.id ?? 1),
    name: String(row.name ?? fallback?.name ?? "Artista"),
    handle: String(
      row.handle ??
        fallback?.handle ??
        `@${String(row.name ?? "artista")
          .toLowerCase()
          .replace(/\s+/g, "")}`
    ),
    email: String(row.email ?? fallback?.email ?? ""),
    city: String(row.city ?? fallback?.city ?? ""),
    state: String(row.state ?? fallback?.state ?? ""),
    territoryScope: (String(
      row.territoryScope ?? fallback?.territoryScope ?? "ESTADUAL"
    ).toUpperCase() || "ESTADUAL") as TerritoryScope,
    bio: String(row.bio ?? fallback?.bio ?? ""),
    avatarUrl,
    tags: mergedTags,
    coreLanguages,
    supportLanguages,
    experienceYears: Number(
      row.experienceYears ?? fallback?.experienceYears ?? 1
    ),
    profileLevel: (String(
      row.profileLevel ?? fallback?.profileLevel ?? "EMERGENTE"
    ).toUpperCase() || "EMERGENTE") as ProfileLevel,
    hasCnpjOrMei: Boolean(
      row.hasCnpjOrMei ?? fallback?.hasCnpjOrMei ?? false
    ),
    hasTechnicalFormation: Boolean(
      row.hasTechnicalFormation ?? fallback?.hasTechnicalFormation ?? false
    ),
    portfolioCompleteness:
      typeof row.portfolioCompleteness === "number"
        ? row.portfolioCompleteness
        : fallback?.portfolioCompleteness ?? 60,
    badges,
    works,
    savedEditalIds,
    likedEditalIds,
  };

  if (typeof row.portfolioCompleteness !== "number") {
    baseProfile.portfolioCompleteness =
      calculatePortfolioCompleteness(baseProfile);
  }

  return baseProfile;
}

export function toRankArtistInput(profile: ArtistProfile): RankArtistInput {
  return {
    id: profile.id,
    city: profile.city || null,
    state: profile.state || null,
    territoryScope: profile.territoryScope,
    coreLanguages:
      profile.coreLanguages.length > 0 ? profile.coreLanguages : profile.tags,
    supportLanguages: profile.supportLanguages,
    experienceYears: profile.experienceYears,
    profileLevel: profile.profileLevel,
    hasCnpjOrMei: profile.hasCnpjOrMei,
    hasTechnicalFormation: profile.hasTechnicalFormation,
    portfolioCompleteness:
      profile.portfolioCompleteness ?? calculatePortfolioCompleteness(profile),
    worksCount: profile.works.length,
    workCategories: profile.works.map((w) => w.category).filter(Boolean),
    badgeCategories: profile.badges.map((b) => b.category).filter(Boolean),
  };
}

export const SEEDED_PROFILES: ArtistProfile[] = [
  {
    id: 1,
    name: "João Silva",
    handle: "@joaosilva",
    email: "joao.silva@email.com",
    city: "Salvador",
    state: "BA",
    territoryScope: "ESTADUAL",
    bio: "Artista visual, ator e compositor. Pesquisa pintura em grandes formatos, cena contemporânea e canção autoral.",
    avatarUrl: "/images/avatar_joao_1794791579584.jpg",
    coreLanguages: ["Pintura", "Teatro"],
    supportLanguages: ["Música"],
    tags: ["Pintura", "Teatro", "Música"],
    experienceYears: 5,
    profileLevel: "EMERGENTE",
    hasCnpjOrMei: true,
    hasTechnicalFormation: false,
    portfolioCompleteness: 88,
    badges: [
      {
        id: "badge-1",
        title: "Contemplado",
        editalName: "Concurso de Pintura Jovem",
        year: "2025",
        category: "Pintura",
        editalId: 301,
        issuerId: 101,
        issuerName: "Empresa A Propostas",
      },
      {
        id: "badge-2",
        title: "Selecionado",
        editalName: "Mostra Cena Aberta de Teatro",
        year: "2026",
        category: "Teatro",
      },
    ],
    works: [
      {
        id: "w-101",
        title: "Maré de Ocre",
        category: "Pintura",
        year: "2025",
        description: "Técnica mista com acrílica e óleo sobre tela crua (120 x 150 cm).",
        imageUrl: "/images/art_pintura_tela_1794791580838.jpg",
        kind: "IMAGEM",
        technique: "Acrílica e óleo sobre tela crua",
        dimensions: "120 × 150 cm",
        tags: ["Abstração", "Paisagem", "Cor"],
      },
      {
        id: "w-102",
        title: "Corpo em Trânsito",
        category: "Teatro",
        year: "2026",
        description: "Registro de cena da montagem autoral sobre deslocamentos urbanos.",
        imageUrl: "/images/art_teatro_palco_1794791582532.jpg",
        kind: "FOTOGRAFIA",
        technique: "Registro fotográfico de cena",
        dimensions: "Impressão 40 × 60 cm",
        tags: ["Cena contemporânea", "Deslocamento", "Cidade"],
      },
      {
        id: "w-103",
        title: "Sessão Acústica no Porto",
        category: "Música",
        year: "2025",
        description: "Apresentação ao vivo de repertório autoral para voz, violão e percussão.",
        imageUrl: "/images/edital_musica_1794791580539.jpg",
        kind: "VIDEO",
        technique: "Registro ao vivo em vídeo",
        dimensions: "Duração 0:06 · amostra",
        tags: ["Canção autoral", "Ao vivo", "Percussão"],
        mediaUrl: "/media/amostra-video.mp4",
      },
    ],
    savedEditalIds: [301],
    likedEditalIds: [302],
  },
  {
    id: 2,
    name: "Mariana Oliveira",
    handle: "@mariana.artes",
    email: "maria.oliveira@email.com",
    city: "Recife",
    state: "PE",
    territoryScope: "METROPOLITANO",
    bio: "Escultora e performer. Investiga cerâmica, madeira de reuso e ocupações artísticas em espaços públicos.",
    avatarUrl: "/images/avatar_maria_1794791579527.jpg",
    coreLanguages: ["Escultura", "Performance"],
    supportLanguages: ["Pintura"],
    tags: ["Escultura", "Performance", "Pintura"],
    experienceYears: 7,
    profileLevel: "CONSOLIDADO",
    hasCnpjOrMei: true,
    hasTechnicalFormation: true,
    portfolioCompleteness: 92,
    badges: [
      {
        id: "badge-3",
        title: "Aprovada",
        editalName: "Bienal de Escultura Contemporânea",
        year: "2025",
        category: "Escultura",
      },
      {
        id: "badge-4",
        title: "Prêmio Destaque",
        editalName: "Ocupação de Espaço Cultural",
        year: "2026",
        category: "Performance",
        editalId: 303,
        issuerId: 103,
        issuerName: "Startup C Cultural",
      },
    ],
    works: [
      {
        id: "w-201",
        title: "Equilíbrio em Madeira e Barro",
        category: "Escultura",
        year: "2026",
        description: "Escultura em cerâmica de alta temperatura encaixada em cedro reaproveitado.",
        imageUrl: "/images/art_escultura_galeria_1794791581583.jpg",
        kind: "IMAGEM",
        technique: "Cerâmica de alta temperatura e cedro reaproveitado",
        dimensions: "60 × 40 × 40 cm",
        tags: ["Escultura", "Reuso", "Equilíbrio"],
      },
      {
        id: "w-202",
        title: "Pátio Aberto",
        category: "Performance",
        year: "2025",
        description: "Instalação têxtil suspensa e ação performática coletiva em pátio público.",
        imageUrl: "/images/edital_ocupacao_1794791581648.jpg",
        kind: "FOTOGRAFIA",
        technique: "Registro de instalação têxtil e ação coletiva",
        dimensions: "Série de 12 fotografias",
        tags: ["Instalação", "Coletivo", "Espaço público"],
      },
      {
        id: "w-203",
        title: "Estudo em Azul e Ocre",
        category: "Pintura",
        year: "2025",
        description: "Série expositiva com grandes telas em pigmentos minerais e folha dourada.",
        imageUrl: "/images/edital_pintura_1794791580477.jpg",
        kind: "IMAGEM",
        technique: "Pigmentos minerais e folha dourada sobre tela",
        dimensions: "Série de 5 telas · 100 × 100 cm",
        tags: ["Cor", "Mineral", "Série"],
      },
    ],
    savedEditalIds: [303],
    likedEditalIds: [],
  },
  {
    id: 3,
    name: "Carlos Músico",
    handle: "@carlos.som",
    email: "carlos.musico@email.com",
    city: "Belo Horizonte",
    state: "MG",
    territoryScope: "NACIONAL",
    bio: "Violonista, diretor musical para teatro e compositor independente focado em música brasileira contemporânea.",
    avatarUrl: "/images/avatar_carlos_1794791579626.jpg",
    coreLanguages: ["Música"],
    supportLanguages: ["Teatro", "Performance"],
    tags: ["Música", "Teatro", "Performance"],
    experienceYears: 4,
    profileLevel: "EMERGENTE",
    hasCnpjOrMei: false,
    hasTechnicalFormation: true,
    portfolioCompleteness: 78,
    badges: [
      {
        id: "badge-5",
        title: "Vencedor",
        editalName: "Festival de Música Popular",
        year: "2025",
        category: "Música",
        editalId: 302,
        issuerId: 102,
        issuerName: "Instituição B Projetos",
      },
    ],
    works: [
      {
        id: "w-301",
        title: "Violão de Madeira Seca",
        category: "Música",
        year: "2025",
        description: "Turnê de lançamento do disco autoral em festivais independentes.",
        imageUrl: "/images/edital_musica_1794791580539.jpg",
        kind: "AUDIO",
        technique: "Gravação em estúdio, violão e voz",
        dimensions: "Duração 0:06 · amostra",
        tags: ["Disco autoral", "Violão", "Canção"],
        mediaUrl: "/media/amostra-acorde.mp3",
      },
      {
        id: "w-302",
        title: "Vozes do Tablado",
        category: "Teatro",
        year: "2026",
        description: "Composição e execução de trilha sonora ao vivo para espetáculo teatral.",
        imageUrl: "/images/art_teatro_palco_1794791582532.jpg",
        kind: "AUDIO",
        technique: "Trilha sonora executada ao vivo",
        dimensions: "Duração 0:06 · amostra",
        tags: ["Teatro", "Trilha", "Ao vivo"],
        mediaUrl: "/media/amostra-acorde.mp3",
      },
      {
        id: "w-303",
        title: "Paisagem Sonora no Pátio",
        category: "Performance",
        year: "2025",
        description: "Intervenção acústica e espacialização sonora em centro cultural.",
        imageUrl: "/images/edital_ocupacao_1794791581648.jpg",
        kind: "VIDEO",
        technique: "Intervenção sonora com espacialização",
        dimensions: "Duração 0:06 · amostra",
        tags: ["Paisagem sonora", "Intervenção", "Centro cultural"],
        mediaUrl: "/media/amostra-video.mp4",
      },
    ],
    savedEditalIds: [302],
    likedEditalIds: [303],
  },
];

export interface PlainEditalSummary {
  whatIsIt: string;
  whoCanApply: string[];
  benefits: string[];
  extraTags: string[];
}

export function getPlainEditalSummary(
  editalId: number,
  title: string,
  description: string
): PlainEditalSummary {
  const summaries: Record<number, PlainEditalSummary> = {
    301: {
      whatIsIt:
        "É uma chamada para artistas de pintura que querem mostrar obras novas em exposição e receber ajuda financeira para comprar tintas, telas e montar o trabalho.",
      whoCanApply: [
        "Artistas independentes maiores de 18 anos com portfólio de pintura.",
        "Não precisa ter empresa aberta (pode participar como pessoa física).",
        "Vale pintura em tela, mural, aquarela ou técnica mista.",
      ],
      benefits: [
        "Bolsa de produção para realizar a obra sem tirar dinheiro do próprio bolso.",
        "Participação em exposição coletiva aberta ao público com divulgação oficial.",
      ],
      extraTags: ["Pintura", "Artes Visuais", "Exposição", "Bolsa de Produção", "Alcance Nacional"],
    },
    302: {
      whatIsIt:
        "É um festival que seleciona bandas, cantores e compositores independentes para tocar músicas próprias em palco profissional, com pagamento de cachê.",
      whoCanApply: [
        "Artistas solo, duplas ou bandas com músicas autorais.",
        "Basta enviar um áudio ou vídeo simples mostrando a música (não precisa ser gravação de estúdio).",
      ],
      benefits: [
        "Cachê pago pela apresentação no festival.",
        "Gravação em áudio e vídeo ao vivo para usar no seu portfólio.",
        "Estrutura completa de som, luz e equipe técnica no dia do show.",
      ],
      extraTags: ["Música", "Autoral", "Show ao Vivo", "Cachê Garantido", "Independente"],
    },
    303: {
      whatIsIt:
        "É uma oportunidade para ocupar salas e pátios de um centro cultural com apresentações de teatro, escultura, dança ou instalações abertas à comunidade.",
      whoCanApply: [
        "Coletivos ou artistas individuais de teatro, escultura, dança e performance.",
        "Projetos que conversem com o público da região e tenham proposta simples de montagem.",
      ],
      benefits: [
        "Espaço cultural cedido gratuitamente com apoio de produção.",
        "Verba para montagem, transporte de obras e divulgação.",
        "Visibilidade em programação oficial gratuita.",
      ],
      extraTags: ["Escultura", "Performance", "Teatro", "Ocupação Cultural", "Coletivos"],
    },
    304: {
      whatIsIt:
        "Programa de formação prática e residência artística para quem atua com teatro ou performance e possui certificado técnico ou curso na área.",
      whoCanApply: [
        "Artistas com formação técnica comprovada em artes cênicas ou teatro.",
        "Disponibilidade para acompanhar oficinas semanais e montagem final.",
      ],
      benefits: [
        "Bolsa mensal durante os meses da residência técnica.",
        "Acompanhamento com diretores e cenógrafos convidados.",
      ],
      extraTags: ["Teatro", "Performance", "Formação Técnica", "Residência", "Bolsa Mensal"],
    },
    305: {
      whatIsIt:
        "Chamada municipal de Recife para artistas locais realizarem oficinas, exposições e intervenções culturais nos bairros da cidade.",
      whoCanApply: [
        "Artistas e produtores culturais residentes no município de Recife (PE).",
        "Propostas de escultura, pintura, música ou artes integradas para espaços comunitários.",
      ],
      benefits: [
        "Apoio financeiro municipal para materiais e cachê de oficina.",
        "Integração na agenda cultural oficial da cidade.",
      ],
      extraTags: ["Recife", "Escultura", "Pintura", "Municipal", "Ação Comunitária"],
    },
  };

  if (summaries[editalId]) {
    return summaries[editalId];
  }

  return {
    whatIsIt:
      description ||
      `Chamada pública aberta para projetos ligados a ${title}, explicada de forma direta para facilitar sua inscrição.`,
    whoCanApply: [
      "Artistas, produtores e coletivos culturais com proposta autoral.",
      "Documentação básica e portfólio simples de trabalhos anteriores.",
    ],
    benefits: [
      "Apoio financeiro ou espaço cedido para realizar o projeto.",
      "Divulgação na programação oficial dos organizadores.",
    ],
    extraTags: ["Cultura", "Fomento", "Inscrição Online"],
  };
}

export interface SessionIdentity {
  id: number;
  email: string;
  name?: string;
  imgUrl?: string | null;
}

const DEFAULT_AVATAR = "/images/avatar_joao_1794791579584.jpg";

/**
 * Perfil mínimo de quem acabou de entrar mas ainda não aparece na lista de artistas (conta nova, ou lista ainda
 * carregando). Existe para o app nunca mostrar o perfil de OUTRA pessoa (antes caía no primeiro da lista).
 */
export function buildFallbackProfile(user: SessionIdentity): ArtistProfile {
  const name = user.name?.trim() || "Artista";
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").slice(0, 20);
  const profile: ArtistProfile = {
    id: user.id,
    name,
    handle: `@${slug || "artista"}`,
    email: user.email,
    city: "",
    state: "",
    territoryScope: "ESTADUAL",
    bio: "",
    avatarUrl: user.imgUrl || DEFAULT_AVATAR,
    tags: [],
    coreLanguages: [],
    supportLanguages: [],
    experienceYears: 0,
    profileLevel: "INICIANTE",
    hasCnpjOrMei: false,
    hasTechnicalFormation: false,
    portfolioCompleteness: 0,
    badges: [],
    works: [],
    savedEditalIds: [],
    likedEditalIds: [],
  };
  profile.portfolioCompleteness = calculatePortfolioCompleteness(profile);
  return profile;
}
