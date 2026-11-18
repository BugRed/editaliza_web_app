import { render, screen, within } from "@testing-library/react";

import CandidatesPanel from "@/shared/components/organisms/CandidatesPanel";
import type { Candidate } from "@/shared/lib/candidates";

const make = (id: number, name: string, over: Partial<Candidate> = {}): Candidate => ({
  id, name, handle: `@${name}`, avatarUrl: "/a.jpg", languages: ["Dança"], city: "Recife", eligibility: "PASS", sharesProfile: true, ...over,
});

describe("CandidatesPanel", () => {
  it("mostra só quem compartilhou, e avisa quantos ficaram de fora sem dizer quem", () => {
    render(<CandidatesPanel editalTitle="Festival" candidates={[make(1, "Ana"), make(2, "Bia", { sharesProfile: false }), make(3, "Caio", { sharesProfile: false })]} />);
    const list = screen.getByRole("list", { name: "Candidatos" });
    expect(within(list).getByText("Ana")).toBeInTheDocument();
    expect(screen.queryByText("Bia")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Mais 2 artistas compatíveis não compartilharam");
  });

  it("nunca mostra nota nem porcentagem", () => {
    render(<CandidatesPanel editalTitle="Festival" candidates={[make(1, "Ana")]} />);
    expect(screen.queryByText(/%|\/ 100/)).not.toBeInTheDocument();
  });

  it("sem ninguém visível mostra o estado vazio", () => {
    render(<CandidatesPanel editalTitle="Festival" candidates={[make(1, "Ana", { sharesProfile: false })]} />);
    expect(screen.getByText(/Nenhum artista compatível compartilhou/)).toBeInTheDocument();
  });

  it("elegibilidade pendente aparece como pendente, não como elegível", () => {
    render(<CandidatesPanel editalTitle="Festival" candidates={[make(1, "Ana", { eligibility: "UNKNOWN" })]} />);
    expect(screen.getByText("Elegibilidade pendente")).toBeInTheDocument();
  });
});
