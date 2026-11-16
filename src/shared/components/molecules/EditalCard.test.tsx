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

  it("sem href o título é texto, não link", () => {
    render(<EditalCard {...base} href={undefined} tags={[]} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Edital Aldir Blanc")).toBeInTheDocument();
  });

  it("link externo abre em outra aba sem vazar a origem", () => {
    render(<EditalCard {...base} href="https://exemplo.gov.br/edital" tags={[]} />);
    const link = screen.getByRole("link", { name: "Edital Aldir Blanc" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
