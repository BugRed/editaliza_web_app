import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RankBars from "@/shared/components/organisms/RankBars";
import { evaluateArtistRank, type ArtistRankResult } from "@/shared/lib/artistrank";

const artist = {
  id: 1, city: "Recife", state: "PE", territoryScope: "ESTADUAL", coreLanguages: ["Pintura"], supportLanguages: [],
  experienceYears: 5, profileLevel: "EMERGENTE", hasCnpjOrMei: true, hasTechnicalFormation: true,
  portfolioCompleteness: 80, worksCount: 3, workCategories: ["Pintura"], badgeCategories: [],
};
const edital = { id: 9, title: "E", territoryScope: "ESTADUAL", state: "PE", requiredLanguages: ["Pintura"], acceptedLanguages: [] };

async function openAllGroups() {
  for (const button of screen.getAllByRole("button", { name: /fatores/ })) await userEvent.click(button);
}

function rank(overrides: Partial<ArtistRankResult> = {}): ArtistRankResult {
  return { ...evaluateArtistRank(artist, edital), ...overrides };
}

describe("RankBars", () => {
  it("mostra score final e uma barra por fator, cada uma como medidor acessível", async () => {
    render(<RankBars rank={rank()} />);
    await openAllGroups();
    expect(screen.getByRole("meter", { name: "Score final" })).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Linguagem artística" })).toBeInTheDocument();
    expect(screen.getAllByRole("meter").length).toBeGreaterThanOrEqual(10);
  });

  it("fator sem dado aparece como 'Sem informação', sem medidor, e entra em 'o que falta informar'", async () => {
    const sparse = evaluateArtistRank({ ...artist, experienceYears: null, worksCount: 0, portfolioCompleteness: null }, edital);
    render(<RankBars rank={sparse} />);
    await openAllGroups();
    expect(screen.queryByRole("meter", { name: "Experiência" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Sem informação").length).toBeGreaterThan(0);
    expect(screen.getByText(/O que falta informar/)).toBeInTheDocument();
  });

  it("inelegível mostra só o motivo, sem barras de score", () => {
    render(<RankBars rank={rank({ bloqueado: true, motivoBloqueio: "Exige CNPJ ou MEI ativo", nivelAderencia: "Inelegível" })} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Exige CNPJ ou MEI ativo");
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
  });

  it("teto aplicado mostra o score antes do teto e o motivo", () => {
    render(<RankBars rank={rank({ tetoAplicado: true, motivoTeto: "Teto 45 aplicado: exige formação", scoreBruto: 80, scoreFinal: 45 })} />);
    expect(screen.getByRole("meter", { name: "Score antes do teto" })).toHaveAttribute("aria-valuenow", "80");
    expect(screen.getByText(/Teto 45 aplicado/)).toBeInTheDocument();
  });

  it("confiança e cobertura ficam fora das barras e não são vendidas como chance de aprovação", () => {
    render(<RankBars rank={rank()} />);
    const note = screen.getByText(/Confiança dos dados/).closest("div") as HTMLElement;
    expect(within(note).queryByRole("meter")).not.toBeInTheDocument();
    expect(note).toHaveTextContent(/não a chance de ser aprovado/);
    expect(screen.queryByRole("meter", { name: /confiança/i })).not.toBeInTheDocument();
  });

  it("limita barra a 0–100 mesmo com valor fora da faixa", () => {
    render(<RankBars rank={rank({ scoreFinal: 140 })} />);
    expect(screen.getByRole("meter", { name: "Score final" })).toHaveAttribute("aria-valuenow", "100");
  });

  it("os dropdowns começam fechados; abrir mostra os fatores e fechar esconde de novo, sem esconder a barra do grupo", async () => {
    render(<RankBars rank={rank()} />);
    const artistGroup = screen.getByRole("region", { name: "Perfil do artista" });
    const toggle = within(artistGroup).getByRole("button", { name: /fatores/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveTextContent("Mostrar os 4 fatores");
    expect(within(artistGroup).getByText("Linguagem artística")).not.toBeVisible();
    expect(within(artistGroup).getByRole("meter", { name: /Perfil do artista/ })).toBeVisible();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Esconder os 4 fatores");
    expect(within(artistGroup).getByText("Linguagem artística")).toBeVisible();

    await userEvent.click(toggle);
    expect(within(artistGroup).getByText("Linguagem artística")).not.toBeVisible();
  });

  it("abrir um grupo não abre o outro", async () => {
    render(<RankBars rank={rank()} />);
    await userEvent.click(within(screen.getByRole("region", { name: "Perfil do artista" })).getByRole("button", { name: /fatores/ }));
    expect(within(screen.getByRole("region", { name: "Perfil do artista" })).getByText("Território")).toBeVisible();
    expect(within(screen.getByRole("region", { name: "Portfólio e obras" })).getByText("Selos na área")).not.toBeVisible();
  });

  it("a legenda explica as três faixas de cor", () => {
    render(<RankBars rank={rank()} />);
    const legend = screen.getByRole("list", { name: "Legenda das cores" });
    expect(legend).toHaveTextContent("Pouco (até 40)");
    expect(legend).toHaveTextContent("Médio (até 70)");
    expect(legend).toHaveTextContent("Alto (acima de 70)");
  });

  it.each([
    [20, "Pouco", "var(--danger)"],
    [55, "Médio", "var(--accent-hover)"],
    [90, "Alto", "var(--success)"],
  ])("nota %s aparece como %s, com cor própria e o nome da faixa no texto (não só na cor)", async (nota, band, color) => {
    const factors = rank().fatores.map((f) => (f.id === "linguagem" ? { ...f, nota } : f));
    render(<RankBars rank={rank({ fatores: factors })} />);
    await openAllGroups();
    const meter = screen.getByRole("meter", { name: "Linguagem artística" });
    expect(meter).toHaveAttribute("aria-valuetext", expect.stringContaining(band.toLowerCase()));
    expect((meter.firstElementChild as HTMLElement).style.backgroundColor).toBe(color);
  });
});
