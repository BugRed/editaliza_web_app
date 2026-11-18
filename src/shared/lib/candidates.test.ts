import { splitCandidates, type Candidate } from "@/shared/lib/candidates";

const make = (id: number, name: string, over: Partial<Candidate> = {}): Candidate => ({
  id, name, handle: `@${id}`, avatarUrl: "/a.jpg", languages: ["Dança"], city: "Recife", eligibility: "PASS", sharesProfile: true, ...over,
});

describe("splitCandidates", () => {
  it("quem não compartilhou o perfil não aparece, e só é contado", () => {
    const { visible, hiddenCount } = splitCandidates([make(1, "Ana"), make(2, "Bia", { sharesProfile: false }), make(3, "Caio", { sharesProfile: false })]);
    expect(visible.map((c) => c.name)).toEqual(["Ana"]);
    expect(hiddenCount).toBe(2);
  });

  it("elegibilidade confirmada vem antes da pendente, depois ordem alfabética", () => {
    const { visible } = splitCandidates([make(1, "Zeca"), make(2, "Ana", { eligibility: "UNKNOWN" }), make(3, "Bia")]);
    expect(visible.map((c) => c.name)).toEqual(["Bia", "Zeca", "Ana"]);
  });

  it("ordem alfabética respeita acentos do português", () => {
    expect(splitCandidates([make(1, "Zélia"), make(2, "Álvaro")]).visible.map((c) => c.name)).toEqual(["Álvaro", "Zélia"]);
  });

  it("sem candidatos devolve vazio", () => {
    expect(splitCandidates([])).toEqual({ visible: [], hiddenCount: 0 });
  });
});
