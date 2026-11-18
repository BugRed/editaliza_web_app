import { render, screen } from "@testing-library/react";

import WhyScoreView from "@/shared/components/organisms/WhyScoreView";
import type { ArtistRankResult } from "@/shared/lib/artistrank";

const baseRank = {
  editalId: 7, rArtista: 60, rPortfolio: 70, scoreBruto: 66, scoreFinal: 66, confiancaC: 70, cobertura: 0.6,
  tetoAplicado: false, bloqueado: false, rotulo: 2, nivelAderencia: "Aderência moderada",
  fatores: [
    { id: "linguagem", grupo: "ARTISTA", label: "Linguagem artística", peso: 0.5, nota: 80 },
    { id: "trajetoria", grupo: "ARTISTA", label: "Nível de trajetória", peso: 0.5, nota: null },
    { id: "obras", grupo: "PORTFOLIO", label: "Obras aderentes", peso: 1, nota: null },
  ],
} as unknown as ArtistRankResult;

describe("WhyScoreView", () => {
  it("sem nota calculada, avisa em vez de mostrar barras vazias", () => {
    render(<WhyScoreView editalTitle="Chamada" editalId={7} rank={null} />);
    expect(screen.getByText(/Ainda não calculamos/)).toBeInTheDocument();
  });

  it("inelegível mostra só o motivo, sem barras", () => {
    render(<WhyScoreView editalTitle="Chamada" editalId={7} rank={{ ...baseRank, bloqueado: true, motivoBloqueio: "residência fora do Recife" }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("residência fora do Recife");
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
  });

  it("fatores sem informação viram links, sem repetir a mesma tela", () => {
    render(<WhyScoreView editalTitle="Chamada" editalId={7} rank={baseRank} />);
    expect(screen.getByRole("link", { name: "Registrar sua trajetória" })).toHaveAttribute("href", "/perfil/trajetoria");
    expect(screen.getByRole("link", { name: "Cadastrar suas obras" })).toHaveAttribute("href", "/perfil/obras");
    expect(screen.getByRole("link", { name: "Voltar ao edital" })).toHaveAttribute("href", "/editais/7");
  });
});
