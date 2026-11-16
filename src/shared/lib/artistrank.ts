// Motor de recomendação ArtistRank — Especificação Empírica v1.1
// Implementa:
// - Combinação ponderada: 0.35 * R_artista + 0.65 * R_portfolio
// - Nulos neutros com medição de cobertura (v4 — sem inflação por dados ausentes)
// - Papéis de linguagem núcleo (peso 1.0) vs suporte (peso 0.65)
// - Bloqueio por inelegibilidade explícita (território / requisito eliminatório)
// - Ajuste A2 (Seção 9.3.1): teto de 45 aplicado ao score final combinado
// - Indicador de Confiança C (Seção 14.4)
// - Regra de escassez (Seção 9.9) quando não há opção relevante elegível

export type TerritoryScope = 'MUNICIPAL' | 'METROPOLITANO' | 'ESTADUAL' | 'NACIONAL';
export type ProfileLevel = 'INICIANTE' | 'EMERGENTE' | 'CONSOLIDADO' | 'MESTRE';

export interface RankArtistInput {
  id: number;
  city?: string | null;
  state?: string | null;
  territoryScope?: TerritoryScope | string | null;
  coreLanguages: string[];
  supportLanguages: string[];
  experienceYears?: number | null;
  profileLevel?: ProfileLevel | string | null;
  hasCnpjOrMei?: boolean | null;
  hasTechnicalFormation?: boolean | null;
  portfolioCompleteness?: number | null;
  worksCount: number;
  workCategories: string[];
  badgeCategories: string[];
}

export interface RankEditalInput {
  id: number;
  title: string;
  territoryScope?: TerritoryScope | string | null;
  city?: string | null;
  state?: string | null;
  requiredLanguages: string[];
  acceptedLanguages: string[];
  requiresPortfolio?: boolean;
  requiresCnpj?: boolean;
  requiresTechnicalFormation?: boolean;
  minExperienceYears?: number;
  targetProfileLevels?: string[];
}

export interface ArtistRankResult {
  editalId: number;
  rArtista: number;
  rPortfolio: number;
  scoreBruto: number;
  scoreFinal: number;
  confiancaC: number;
  cobertura: number;
  tetoAplicado: boolean;
  motivoTeto?: string;
  bloqueado: boolean;
  motivoBloqueio?: string;
  rotulo: 0 | 1 | 2 | 3;
  nivelAderencia: 'Aderência forte' | 'Aderência moderada' | 'Aderência baixa' | 'Inelegível';
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function evaluateArtistRank(
  artist: RankArtistInput,
  edital: RankEditalInput
): ArtistRankResult {
  const editalLangs = Array.from(
    new Set([...edital.requiredLanguages, ...edital.acceptedLanguages].map(normalize))
  ).filter(Boolean);

  const coreSet = new Set(artist.coreLanguages.map(normalize));
  const supportSet = new Set(artist.supportLanguages.map(normalize));
  const workCatSet = new Set(artist.workCategories.map(normalize));
  const badgeCatSet = new Set(artist.badgeCategories.map(normalize));

  // 1. Verificação de bloqueio explícito (território e requisitos eliminatórios)
  let bloqueado = false;
  let motivoBloqueio: string | undefined;

  const editalScope = (edital.territoryScope || 'NACIONAL').toUpperCase();
  const artistCity = normalize(artist.city || '');
  const editalCity = normalize(edital.city || '');
  const artistState = normalize(artist.state || '');
  const editalState = normalize(edital.state || '');

  if (editalScope === 'MUNICIPAL' && editalCity && artistCity && artistCity !== editalCity) {
    bloqueado = true;
    motivoBloqueio = `Restrito ao município de ${edital.city}`;
  } else if (
    editalScope === 'METROPOLITANO' &&
    editalState &&
    artistState &&
    artistState !== editalState
  ) {
    bloqueado = true;
    motivoBloqueio = `Restrito à região metropolitana (${edital.state})`;
  } else if (
    editalScope === 'ESTADUAL' &&
    editalState &&
    artistState &&
    artistState !== editalState
  ) {
    bloqueado = true;
    motivoBloqueio = `Exclusivo para residentes em ${edital.state}`;
  }

  if (!bloqueado && edital.requiresCnpj && artist.hasCnpjOrMei === false) {
    bloqueado = true;
    motivoBloqueio = 'Exige CNPJ ou MEI ativo';
  }

  // 2. R_artista (35%) com nulos neutros e cobertura
  const artistFactors: Array<{ weight: number; score: number }> = [];
  let nonNullCriteria = 0;
  const totalCriteria = 6;

  // 2a. Linguagens núcleo (1.0) vs suporte (0.65)
  if (editalLangs.length > 0 && (coreSet.size > 0 || supportSet.size > 0)) {
    nonNullCriteria += 1;
    let bestLangScore = 0;
    let matchedCount = 0;

    for (const reqLang of editalLangs) {
      if (coreSet.has(reqLang)) {
        bestLangScore = Math.max(bestLangScore, 100);
        matchedCount += 1;
      } else if (supportSet.has(reqLang)) {
        bestLangScore = Math.max(bestLangScore, 65);
        matchedCount += 0.65;
      }
    }

    const breadthBonus =
      editalLangs.length > 1
        ? (matchedCount / editalLangs.length) * 12
        : 0;
    const langScore = clamp(bestLangScore * 0.88 + breadthBonus, 0, 100);
    artistFactors.push({ weight: 0.48, score: langScore });
  }

  // 2b. Território
  if (artistState || artistCity || editalScope === 'NACIONAL') {
    nonNullCriteria += 1;
    let territoryScore = 82;
    if (bloqueado && motivoBloqueio?.includes('Restrito')) {
      territoryScore = 15;
    } else if (editalScope === 'NACIONAL') {
      territoryScore = 92;
    } else if (editalCity && artistCity === editalCity) {
      territoryScore = 100;
    } else if (editalState && artistState === editalState) {
      territoryScore = 90;
    }
    artistFactors.push({ weight: 0.2, score: territoryScore });
  }

  // 2c. Experiência e nível artístico
  if (typeof artist.experienceYears === 'number') {
    nonNullCriteria += 1;
    const minExp = edital.minExperienceYears ?? 0;
    const expScore =
      minExp <= 0
        ? clamp(72 + artist.experienceYears * 4, 72, 96)
        : artist.experienceYears >= minExp
        ? clamp(84 + (artist.experienceYears - minExp) * 3, 84, 100)
        : clamp((artist.experienceYears / Math.max(minExp, 1)) * 68, 25, 68);
    artistFactors.push({ weight: 0.16, score: expScore });
  }

  // 2d. Nível de trajetória (profileLevel)
  if (artist.profileLevel) {
    nonNullCriteria += 1;
    const targets = (edital.targetProfileLevels ?? []).map((t) => t.toUpperCase());
    const levelScore =
      targets.length === 0
        ? 82
        : targets.includes(artist.profileLevel.toUpperCase())
        ? 96
        : 58;
    artistFactors.push({ weight: 0.16, score: levelScore });
  }

  const rArtista =
    artistFactors.length > 0
      ? artistFactors.reduce((acc, f) => acc + f.score * f.weight, 0) /
        artistFactors.reduce((acc, f) => acc + f.weight, 0)
      : 50; // neutro quando ausente

  // 3. R_portfolio (65%) — obras aderentes, completude e badges
  const portfolioFactors: Array<{ weight: number; score: number }> = [];

  if (artist.worksCount > 0) {
    nonNullCriteria += 1;
    let workMatchCount = 0;
    for (const lang of editalLangs) {
      if (workCatSet.has(lang)) workMatchCount += 1;
    }
    const workRelevance =
      editalLangs.length > 0 && workMatchCount > 0
        ? clamp(74 + (workMatchCount / editalLangs.length) * 24, 74, 98)
        : artist.worksCount > 0
        ? 44
        : 30;
    const volumeScore = clamp(55 + Math.min(artist.worksCount, 4) * 10, 55, 95);
    portfolioFactors.push({ weight: 0.55, score: workRelevance * 0.7 + volumeScore * 0.3 });
  }

  if (typeof artist.portfolioCompleteness === 'number') {
    nonNullCriteria += 1;
    const completenessScore = clamp(artist.portfolioCompleteness, 20, 100);
    portfolioFactors.push({ weight: 0.3, score: completenessScore });
  }

  // Bônus leve por badge conquistada na área
  let badgeScore = 62;
  if (editalLangs.some((lang) => badgeCatSet.has(lang))) {
    badgeScore = 92;
  } else if (badgeCatSet.size > 0) {
    badgeScore = 76;
  }
  portfolioFactors.push({ weight: 0.15, score: badgeScore });

  const rPortfolio =
    portfolioFactors.length > 0
      ? portfolioFactors.reduce((acc, f) => acc + f.score * f.weight, 0) /
        portfolioFactors.reduce((acc, f) => acc + f.weight, 0)
      : 48;

  // 4. Score bruto combinado: 0.35 * R_artista + 0.65 * R_portfolio
  const scoreBruto = 0.35 * rArtista + 0.65 * rPortfolio;

  // 5. Ajuste A2 (Seção 9.3.1): Teto de 45 incide sobre o SCORE FINAL COMBINADO
  // quando um requisito explícito não é cumprido.
  let tetoAplicado = false;
  let motivoTeto: string | undefined;

  const hasRequiredLangMatch =
    edital.requiredLanguages.length === 0 ||
    edital.requiredLanguages
      .map(normalize)
      .some((req) => coreSet.has(req) || supportSet.has(req));

  if (edital.requiresTechnicalFormation && !artist.hasTechnicalFormation) {
    tetoAplicado = true;
    motivoTeto = 'Teto 45 aplicado: edital exige formação técnica comprovada';
  } else if (!hasRequiredLangMatch) {
    tetoAplicado = true;
    motivoTeto = `Teto 45 aplicado: requisito principal (${edital.requiredLanguages.join(', ')}) ausente no perfil`;
  } else if (edital.requiresPortfolio && artist.worksCount === 0) {
    tetoAplicado = true;
    motivoTeto = 'Teto 45 aplicado: edital exige trabalhos publicados no portfólio';
  }

  const scoreFinal = tetoAplicado ? Math.min(scoreBruto, 45) : scoreBruto;

  // 6. Cobertura e Confiança C (faixa empírica 53.5 - 91.2 na seção 14.4)
  const cobertura = round2((nonNullCriteria / totalCriteria) * 100);
  const evidenceBonus = Math.min(artist.worksCount, 3) * 2.2;
  const confiancaC = round2(
    clamp(53.5 + (cobertura / 100) * 31.1 + evidenceBonus, 53.5, 91.2)
  );

  // 7. Rótulo de aderência
  let rotulo: 0 | 1 | 2 | 3 = 1;
  let nivelAderencia: ArtistRankResult['nivelAderencia'] = 'Aderência baixa';

  if (bloqueado) {
    rotulo = 0;
    nivelAderencia = 'Inelegível';
  } else if (scoreFinal >= 68) {
    rotulo = 3;
    nivelAderencia = 'Aderência forte';
  } else if (scoreFinal >= 50) {
    rotulo = 2;
    nivelAderencia = 'Aderência moderada';
  }

  return {
    editalId: edital.id,
    rArtista: round2(rArtista),
    rPortfolio: round2(rPortfolio),
    scoreBruto: round2(scoreBruto),
    scoreFinal: round2(scoreFinal),
    confiancaC,
    cobertura,
    tetoAplicado,
    motivoTeto,
    bloqueado,
    motivoBloqueio,
    rotulo,
    nivelAderencia,
  };
}

export function rankEditalsForArtist(
  artist: RankArtistInput,
  editals: RankEditalInput[]
): {
  results: ArtistRankResult[];
  avisoEscassez: boolean;
} {
  const results = editals
    .map((edital) => evaluateArtistRank(artist, edital))
    .sort((a, b) => {
      // Elegíveis sempre antes de bloqueados
      if (a.bloqueado !== b.bloqueado) return a.bloqueado ? 1 : -1;
      // Maior scoreFinal primeiro
      if (b.scoreFinal !== a.scoreFinal) return b.scoreFinal - a.scoreFinal;
      // Desempate por maior confiança C
      return b.confiancaC - a.confiancaC;
    });

  // Seção 9.9: aviso de escassez quando não há nenhuma opção relevante elegível (rótulo >= 2)
  const hasRelevantEligible = results.some((r) => !r.bloqueado && r.rotulo >= 2);

  return {
    results,
    avisoEscassez: !hasRelevantEligible,
  };
}
