export type TriState = "yes" | "no" | "unknown";

export const INTEREST_OPTIONS = ["Exposição", "Residência", "Circulação", "Formação", "Premiação", "Desenvolver obra nova"] as const;

export interface OnboardingValues {
  artisticName: string;
  bio: string;
  statement: string;
  languages: string[];
  techniques: string;
  themes: string;
  positioning: string;
  interests: string[];
  canTravel: TriState;
  hasTeam: TriState;
  hasDocumentation: TriState;
}

export const EMPTY_ONBOARDING: OnboardingValues = {
  artisticName: "",
  bio: "",
  statement: "",
  languages: [],
  techniques: "",
  themes: "",
  positioning: "",
  interests: [],
  canTravel: "unknown",
  hasTeam: "unknown",
  hasDocumentation: "unknown",
};

const FIELDS: { label: string; isFilled: (v: OnboardingValues) => boolean }[] = [
  { label: "Nome artístico", isFilled: (v) => v.artisticName.trim() !== "" },
  { label: "Biografia", isFilled: (v) => v.bio.trim() !== "" },
  { label: "Declaração artística", isFilled: (v) => v.statement.trim() !== "" },
  { label: "Linguagens", isFilled: (v) => v.languages.length > 0 },
  { label: "Técnicas e suportes", isFilled: (v) => v.techniques.trim() !== "" },
  { label: "Temas e conceitos", isFilled: (v) => v.themes.trim() !== "" },
  { label: "Posicionamento", isFilled: (v) => v.positioning.trim() !== "" },
  { label: "Interesses", isFilled: (v) => v.interests.length > 0 },
  { label: "Disponibilidade para viajar", isFilled: (v) => v.canTravel !== "unknown" },
  { label: "Equipe", isFilled: (v) => v.hasTeam !== "unknown" },
  { label: "Documentação completa", isFilled: (v) => v.hasDocumentation !== "unknown" },
];

export interface ProfileCoverage {
  filled: number;
  total: number;
  /** 0 a 1. Campo vazio é desconhecido, não nota zero: só reduz a cobertura, nunca a compatibilidade. */
  fraction: number;
  missing: string[];
}

export function computeProfileCoverage(values: OnboardingValues): ProfileCoverage {
  const missing = FIELDS.filter((field) => !field.isFilled(values)).map((field) => field.label);
  const total = FIELDS.length;
  return { filled: total - missing.length, total, fraction: (total - missing.length) / total, missing };
}

export const ONBOARDING_STEPS = ["Identidade", "Linguagens e técnicas", "Temas e posicionamento", "Intenção e disponibilidade"] as const;
