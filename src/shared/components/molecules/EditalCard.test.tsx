import { render, screen } from "@testing-library/react";

import { EditalCard } from "@/shared/components/molecules/EditalCard";

const base = {
  href: "/editais/1",
  title: "Edital Aldir Blanc",
  organization: "SecultPE",
  deadlineLabel: "Até 30/12",
};

describe("EditalCard", () => {
  it("o título é o link para o detalhe", () => {
    render(<EditalCard {...base} tags={["Artes visuais"]} />);
    expect(screen.getByRole("link", { name: "Edital Aldir Blanc" })).toHaveAttribute("href", "/editais/1");
    expect(screen.getByRole("list", { name: "Tags" })).toHaveTextContent("Artes visuais");
  });

  it("sem tags não renderiza lista vazia", () => {
    render(<EditalCard {...base} tags={[]} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("não exibe porcentagem de compatibilidade", () => {
    render(<EditalCard {...base} tags={[]} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
