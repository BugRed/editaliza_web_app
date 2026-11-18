import type { Candidate } from "@/shared/lib/candidates";

// Dados fixos da prévia da área da organização (O5): ainda não há candidatura nem consentimento gravado.
export const CANDIDATES_FIXTURE: Candidate[] = [
  { id: 101, name: "Marina Alves", handle: "@marina.alves", avatarUrl: "/images/avatar_maria_1794791579527.jpg", languages: ["Dança", "Performance"], city: "Recife", eligibility: "PASS", sharesProfile: true },
  { id: 102, name: "João Pedro Lima", handle: "@jplima", avatarUrl: "/images/avatar_joao_1794791579584.jpg", languages: ["Dança"], city: "Olinda", eligibility: "UNKNOWN", sharesProfile: true },
  { id: 103, name: "Carlos Mendes", handle: "@carlosm", avatarUrl: "/images/avatar_carlos_1794791579626.jpg", languages: ["Teatro", "Dança"], city: "Recife", eligibility: "PASS", sharesProfile: false },
  { id: 104, name: "Luíza Ferraz", handle: "@luferraz", avatarUrl: "/images/avatar_maria_1794791579527.jpg", languages: ["Dança"], city: "Recife", eligibility: "PASS", sharesProfile: false },
];
