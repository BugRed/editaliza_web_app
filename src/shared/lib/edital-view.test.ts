import type { IEdital } from "@/app/types/Edital";
import { filterEditalCards, formatDeadline, toEditalCardData } from "@/shared/lib/edital-view";

const NOW = new Date("2026-11-16T12:00:00Z");

describe("formatDeadline", () => {
  it("sem data, avisa que o prazo não foi informado", () => {
    expect(formatDeadline(null, NOW)).toBe("Prazo não informado");
    expect(formatDeadline("lixo", NOW)).toBe("Prazo não informado");
  });

  it("prazo futuro mostra 'até'; passado mostra 'encerrado' (aceita string da API)", () => {
    expect(formatDeadline("2026-12-30T00:00:00Z", NOW)).toBe("Inscrições até 30/12/2026");
    expect(formatDeadline("2026-11-01T00:00:00Z", NOW)).toBe("Encerrado em 01/11/2026");
  });
});

describe("toEditalCardData", () => {
  it("tolera edital sem proponente, sem tags e sem links", () => {
    const edital = { id: 1, title: "X", endDate: null } as unknown as IEdital;
    expect(toEditalCardData(edital, NOW)).toEqual({
      id: 1,
      title: "X",
      organization: "Organização não informada",
      deadlineLabel: "Prazo não informado",
      description: undefined,
      coverImage: undefined,
      statusLabel: "Edital aberto",
      submitHref: undefined,
      tags: [],
    });
  });

  it("prefere o link de inscrição ao do edital completo", () => {
    const edital = { id: 1, title: "X", completeEditalLink: "https://a", inscriptionLink: "https://b" } as unknown as IEdital;
    expect(toEditalCardData(edital, NOW).submitHref).toBe("https://b");
  });

  it("prazo vencido marca o edital como encerrado", () => {
    const edital = { id: 1, title: "X", endDate: "2026-11-01T00:00:00Z" } as unknown as IEdital;
    expect(toEditalCardData(edital, NOW).statusLabel).toBe("Encerrado");
  });
});

describe("filterEditalCards", () => {
  const cards = [
    { id: 1, title: "Pintura em Recife", organization: "Secult", deadlineLabel: "", tags: ["Artes visuais"] },
    { id: 2, title: "Teatro", organization: "Funarte", deadlineLabel: "", tags: [] },
  ];

  it("busca sem diferenciar maiúsculas, em título, organização e tags", () => {
    expect(filterEditalCards(cards, "recife").map((c) => c.id)).toEqual([1]);
    expect(filterEditalCards(cards, "FUNARTE").map((c) => c.id)).toEqual([2]);
    expect(filterEditalCards(cards, "visuais").map((c) => c.id)).toEqual([1]);
  });

  it("termo vazio ou só espaços devolve tudo", () => {
    expect(filterEditalCards(cards, "  ")).toHaveLength(2);
  });
});
