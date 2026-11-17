import { checkTrajectoryDraft, durationMonths, sortTrajectory, summarizeTrajectory, type TrajectoryDraft, type TrajectoryEntry } from "@/shared/lib/trajectory";

const draft: TrajectoryDraft = {
  category: "Experiência profissional",
  title: "Estágio em produção cultural",
  institution: "Instituição cultural",
  role: "assistente",
  startDate: "2024-03-01",
  endDate: "2024-12-01",
  evidenceStatus: "declared",
};
const now = new Date("2026-11-17");

describe("checkTrajectoryDraft", () => {
  it("estágio é uma experiência válida como qualquer outra", () => {
    expect(checkTrajectoryDraft(draft)).toBeNull();
  });

  it("recusa título vazio, início ausente e término antes do início", () => {
    expect(checkTrajectoryDraft({ ...draft, title: " " })).toMatch(/título/);
    expect(checkTrajectoryDraft({ ...draft, startDate: "" })).toMatch(/começou/);
    expect(checkTrajectoryDraft({ ...draft, endDate: "2023-01-01" })).toMatch(/antes do início/);
  });

  it("em andamento (sem término) é válido", () => {
    expect(checkTrajectoryDraft({ ...draft, endDate: "" })).toBeNull();
  });
});

describe("durationMonths", () => {
  it("conta os meses entre início e término", () => {
    expect(durationMonths(draft, now)).toBe(9);
  });

  it("em andamento conta até hoje, e nunca devolve menos de 1 mês", () => {
    expect(durationMonths({ startDate: "2026-01-01", endDate: "" }, now)).toBe(10);
    expect(durationMonths({ startDate: "2026-11-10", endDate: "2026-11-12" }, now)).toBe(1);
  });
});

describe("resumo e ordem", () => {
  const entries: TrajectoryEntry[] = [
    { ...draft, id: "a" },
    { ...draft, id: "b", category: "Exposição", startDate: "2025-05-01", endDate: "2025-06-01", evidenceStatus: "verified" },
  ];

  it("resume quantidade, verificadas, meses e categorias distintas", () => {
    expect(summarizeTrajectory(entries, now)).toEqual({ count: 2, verified: 1, totalMonths: 10, categories: ["Experiência profissional", "Exposição"] });
  });

  it("ordena do mais recente para o mais antigo sem alterar a lista original", () => {
    expect(sortTrajectory(entries).map((e) => e.id)).toEqual(["b", "a"]);
    expect(entries[0].id).toBe("a");
  });

  it("trajetória vazia resume em zeros", () => {
    expect(summarizeTrajectory([], now)).toEqual({ count: 0, verified: 0, totalMonths: 0, categories: [] });
  });
});
