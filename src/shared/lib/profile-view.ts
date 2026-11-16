export type EditalSummary = {
  whatIsIt: string;
  whoCanApply: string[];
  benefits: string[];
  extraTags: string[];
};

export type EditalDetailData = {
  id: number;
  title: string;
  organization: string;
  deadlineLabel: string;
  closed: boolean;
  summary: EditalSummary | null;
  officialLink: string;
  tags: string[];
  coverImage?: string;
};

export type Work = { id: number; title: string; technique: string; year: number; support: string; imageUrl?: string };

export type ProofState = "comprovada" | "declarada" | "sem-comprovacao";
export type Experience = { id: number; title: string; category: string; year: number; proof: ProofState };

export type FactorLevel = "alto" | "medio" | "baixo" | "desconhecido";
export type MatchFactor = { label: string; level: FactorLevel; note: string };

export type EligibilityState = "elegivel" | "inelegivel" | "desconhecido";
export type Candidate = { id: number; name: string; city: string; languages: string[]; eligibility: EligibilityState };

export type PublicArtist = { name: string; city: string; languages: string[]; bio: string; avatarUrl?: string; works: Work[] };

export type AdminEditalStatus = "processando" | "revisao" | "falha" | "publicado";
export type AdminEdital = { id: number; title: string; status: AdminEditalStatus; note?: string };

export type RequirementKind = "CORE" | "SUPPORT";
export type Requirement = { text: string; kind: RequirementKind; evidence: string };
