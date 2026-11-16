import { render, screen, within } from "@testing-library/react";

import { MatchExplanation } from "@/shared/components/organisms/MatchExplanation";
import { MATCH_FACTORS } from "@/shared/fixtures/prototype";

describe("MatchExplanation", () => {
  it("fator sem dado aparece como 'sem informação' e entra em 'o que falta informar'", () => {
    render(<MatchExplanation editalTitle="X" factors={MATCH_FACTORS} />);
    const missing = screen.getByRole("region", { name: "O que falta informar" });
    expect(within(missing).getByText("Trajetória")).toBeInTheDocument();
    expect(within(missing).queryByText("Linguagem artística")).not.toBeInTheDocument();
    expect(screen.getAllByText("Sem informação")).toHaveLength(2);
  });

  it("sem fator desconhecido, não mostra a seção de pendências", () => {
    render(<MatchExplanation editalTitle="X" factors={[MATCH_FACTORS[0]]} />);
    expect(screen.queryByRole("region", { name: "O que falta informar" })).not.toBeInTheDocument();
  });
});
