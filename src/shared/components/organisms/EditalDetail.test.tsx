import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditalDetail } from "@/shared/components/organisms/EditalDetail";
import { EDITAL_DETAILS } from "@/shared/fixtures/prototype";

describe("EditalDetail", () => {
  it("mostra o resumo em linguagem simples quando existe", () => {
    render(<EditalDetail edital={EDITAL_DETAILS[0]} />);
    expect(screen.getByRole("region", { name: "Quem pode participar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edital oficial/i })).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("sem resumo, avisa e continua oferecendo o texto oficial; encerrado fica marcado", () => {
    render(<EditalDetail edital={EDITAL_DETAILS[1]} />);
    expect(screen.getByText(/resumo deste edital ainda não está disponível/i)).toBeInTheDocument();
    expect(screen.getByText("Encerrado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edital oficial/i })).toBeInTheDocument();
  });

  it("salvar alterna o estado", async () => {
    render(<EditalDetail edital={EDITAL_DETAILS[0]} />);
    const button = screen.getByRole("button", { name: "Salvar" });
    await userEvent.click(button);
    expect(screen.getByRole("button", { name: "Salvo" })).toHaveAttribute("aria-pressed", "true");
  });

  it("dispensar exige motivo e registra o escolhido", async () => {
    render(<EditalDetail edital={EDITAL_DETAILS[0]} />);
    await userEvent.click(screen.getByRole("button", { name: "Não tenho interesse" }));
    await userEvent.selectOptions(screen.getByLabelText("Motivo"), "Não sou elegível");
    await userEvent.click(screen.getByRole("button", { name: "Dispensar edital" }));

    expect(screen.getByRole("status")).toHaveTextContent("Não sou elegível");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
