import type {
  AdminEdital,
  Candidate,
  EditalDetailData,
  Experience,
  MatchFactor,
  PublicArtist,
  Requirement,
  Work,
} from "@/shared/lib/profile-view";
import type { EditalCardData } from "@/shared/lib/edital-view";

// Tudo aqui é inventado, só para o protótipo: nenhum edital, órgão ou pessoa reais.

export const EDITAL_DETAILS: EditalDetailData[] = [
  {
    id: 1,
    title: "Prêmio Exemplo de Artes Visuais",
    organization: "Secretaria de Cultura (exemplo)",
    deadlineLabel: "Inscrições até 30/12/2026",
    closed: false,
    officialLink: "https://exemplo.gov.br/edital-1",
    tags: ["Artes visuais"],
    summary: {
      whatIsIt: "Prêmio em dinheiro para artistas visuais que já têm uma série de trabalhos e querem mostrá-la numa exposição.",
      whoCanApply: ["Artistas visuais com residência no estado há pelo menos 2 anos", "Pessoas físicas ou MEI"],
      benefits: ["R$ 20 mil por projeto selecionado", "Exposição coletiva com catálogo"],
      extraTags: ["Premiação", "Exposição"],
    },
  },
  {
    id: 2,
    title: "Residência Exemplo de Criação Sonora",
    organization: "Fundação Cultural (exemplo)",
    deadlineLabel: "Encerrado em 01/11/2026",
    closed: true,
    officialLink: "https://exemplo.gov.br/edital-2",
    tags: ["Música"],
    summary: null,
  },
  {
    id: 3,
    title: "Bolsa Exemplo de Pesquisa em Teatro",
    organization: "Instituto de Artes (exemplo)",
    deadlineLabel: "Prazo não informado",
    closed: false,
    officialLink: "https://exemplo.gov.br/edital-3",
    tags: ["Teatro", "Pesquisa"],
    summary: {
      whatIsIt: "Bolsa mensal por 12 meses para quem pesquisa processos de criação teatral.",
      whoCanApply: ["Artistas e grupos de teatro", "Sem exigência de CNPJ"],
      benefits: ["Bolsa mensal de R$ 2 mil"],
      extraTags: [],
    },
  },
];

export function toCardData(detail: EditalDetailData): EditalCardData {
  return {
    id: detail.id,
    title: detail.title,
    organization: detail.organization,
    deadlineLabel: detail.deadlineLabel,
    tags: detail.tags,
  };
}

export const EDITAL_CARDS: EditalCardData[] = EDITAL_DETAILS.map(toCardData);

export const MATCH_FACTORS: MatchFactor[] = [
  { label: "Linguagem artística", level: "alto", note: "O edital pede artes visuais e o seu perfil é artes visuais." },
  { label: "Território", level: "alto", note: "Você mora no estado exigido." },
  { label: "Técnicas", level: "medio", note: "Pede pintura; você informou pintura e gravura." },
  { label: "Trajetória", level: "desconhecido", note: "Você ainda não registrou exposições." },
  { label: "Obras", level: "desconhecido", note: "Nenhuma obra cadastrada." },
];

export const EXPERIENCES: Experience[] = [
  { id: 1, title: "Exposição coletiva “Maré”", category: "Exposição", year: 2024, proof: "comprovada" },
  { id: 2, title: "Residência artística em ateliê", category: "Residência", year: 2023, proof: "declarada" },
  { id: 3, title: "Estágio em galeria", category: "Estágio", year: 2022, proof: "sem-comprovacao" },
];

export const WORKS: Work[] = [
  { id: 1, title: "Vista da janela", technique: "Pintura", support: "Tela", year: 2024 },
  { id: 2, title: "Sal e ferrugem", technique: "Gravura", support: "Papel", year: 2023 },
];

export const PUBLIC_ARTIST: PublicArtist = {
  name: "Maria Exemplo",
  city: "Recife, PE",
  languages: ["Artes visuais"],
  bio: "Artista visual que trabalha com pintura e gravura a partir da paisagem urbana.",
  works: WORKS,
};

export const ADMIN_EDITAIS: AdminEdital[] = [
  { id: 1, title: "Prêmio Exemplo de Artes Visuais", status: "publicado" },
  { id: 2, title: "Residência Exemplo de Criação Sonora", status: "revisao" },
  { id: 3, title: "Bolsa Exemplo de Pesquisa em Teatro", status: "processando" },
  { id: 4, title: "Edital escaneado sem texto", status: "falha", note: "Não foi possível ler o PDF. Envie uma versão com texto." },
];

export const REQUIREMENTS: Requirement[] = [
  { text: "Residir no estado há pelo menos 2 anos", kind: "CORE", evidence: "Poderão participar artistas com residência comprovada de no mínimo 2 (dois) anos." },
  { text: "Portfólio com ao menos 5 obras", kind: "SUPPORT", evidence: "O portfólio deverá conter de 5 a 10 obras." },
];

export const CANDIDATES: Candidate[] = [
  { id: 1, name: "Maria Exemplo", city: "Recife, PE", languages: ["Artes visuais"], eligibility: "elegivel" },
  { id: 2, name: "João Exemplo", city: "Olinda, PE", languages: ["Artes visuais", "Audiovisual"], eligibility: "desconhecido" },
  { id: 3, name: "Ana Exemplo", city: "São Paulo, SP", languages: ["Artes visuais"], eligibility: "inelegivel" },
];
