import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditalCard } from "@/shared/components/molecules/EditalCard";

const base = {
  title: "Edital Aldir Blanc",
  organization: "Secretaria de Cultura",
  dateLabel: "Inscrições até 30/12/2026",
  tags: ["Artes visuais", "Premiação"],
};

describe("EditalCard", () => {
  it("o título é link só quando há página de detalhe", () => {
    const { rerender } = render(<EditalCard {...base} detailHref="/editais/1" />);
    expect(screen.getByRole("link", { name: "Edital Aldir Blanc" })).toHaveAttribute("href", "/editais/1");

    rerender(<EditalCard {...base} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Edital Aldir Blanc" })).toBeInTheDocument();
  });

  it("inscrever-se abre o link externo em outra aba sem vazar a origem; sem link, não aparece", () => {
    const { rerender } = render(<EditalCard {...base} submitHref="https://exemplo.gov.br/inscricao" />);
    const link = screen.getByRole("link", { name: /inscrever-se/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    rerender(<EditalCard {...base} />);
    expect(screen.queryByRole("link", { name: /inscrever-se/i })).not.toBeInTheDocument();
  });

  it("descrição longa começa recolhida e 'Continuar lendo' alterna", async () => {
    render(<EditalCard {...base} description={"texto ".repeat(40)} />);
    await userEvent.click(screen.getByRole("button", { name: "Continuar lendo" }));
    expect(screen.getByRole("button", { name: "Ler menos" })).toBeInTheDocument();
  });

  it("descrição curta não oferece 'Continuar lendo'", () => {
    render(<EditalCard {...base} description="curta" />);
    expect(screen.queryByRole("button", { name: "Continuar lendo" })).not.toBeInTheDocument();
  });

  it("curtir e salvar alternam o estado pressionado", async () => {
    render(<EditalCard {...base} />);
    await userEvent.click(screen.getByRole("button", { name: "Curtir edital" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar edital" }));
    expect(screen.getByRole("button", { name: "Remover curtida" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Remover dos salvos" })).toHaveAttribute("aria-pressed", "true");
  });

  it("mostra as iniciais da organização, o selo de status e as tags", () => {
    render(<EditalCard {...base} statusLabel="Edital aberto" />);
    expect(screen.getByText("SD")).toBeInTheDocument();
    expect(screen.getByText("Edital aberto")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Tags" })).toHaveTextContent("Artes visuais");
  });

  it("sem capa mostra o fallback com o título; não exibe porcentagem de compatibilidade", () => {
    render(<EditalCard {...base} />);
    expect(screen.getAllByText("Edital Aldir Blanc").length).toBeGreaterThan(1);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
