import type { ExtractedRequirement } from "@/shared/lib/requirement-review";

export type IngestStatus = "PROCESSING" | "FAILED" | "REVIEW" | "PUBLISHED";

export interface IngestJob {
  id: string;
  title: string;
  fileName: string;
  uploadedAt: string;
  status: IngestStatus;
  failureReason?: string;
  requirements: ExtractedRequirement[];
}

// Dados fixos da prévia do admin (O3): não há upload, fila de extração nem banco ainda.
export const INITIAL_JOBS: IngestJob[] = [
  {
    id: "job-1",
    title: "Festival de Dança do Recife 2026",
    fileName: "festival-danca-2026.pdf",
    uploadedAt: "2026-11-15",
    status: "REVIEW",
    requirements: [
      { id: "r1", kind: "language", label: "Dança", value: "danca", strength: "explicit_mandatory", role: "CORE", evidence: "Art. 3º: podem se inscrever proponentes da linguagem dança.", confidence: 0.96, reviewed: false },
      { id: "r2", kind: "language", label: "Fotografia", value: "fotografia", strength: "preference", role: null, evidence: "Art. 5º: registros em fotografia serão aceitos como material de apoio.", confidence: 0.62, reviewed: false },
      { id: "r3", kind: "territory", label: "Residência no Recife", value: "city_recife", strength: "explicit_mandatory", role: null, evidence: null, confidence: 0.9, reviewed: false },
    ],
  },
  {
    id: "job-2",
    title: "Chamada de Artes Visuais Olinda",
    fileName: "artes-visuais-olinda.pdf",
    uploadedAt: "2026-11-16",
    status: "PROCESSING",
    requirements: [],
  },
  {
    id: "job-3",
    title: "Edital de Música Caruaru",
    fileName: "musica-caruaru-scan.pdf",
    uploadedAt: "2026-11-14",
    status: "FAILED",
    failureReason: "O PDF é uma imagem escaneada sem texto. Envie uma versão com texto selecionável.",
    requirements: [],
  },
  {
    id: "job-4",
    title: "Bolsa de Formação Escola de Frevo",
    fileName: "bolsa-frevo.pdf",
    uploadedAt: "2026-11-10",
    status: "PUBLISHED",
    requirements: [
      { id: "r9", kind: "language", label: "Frevo", value: "frevo", strength: "explicit_mandatory", role: "CORE", evidence: "Item 1.2: bolsa para formação em frevo.", confidence: 0.98, reviewed: true },
    ],
  },
];
