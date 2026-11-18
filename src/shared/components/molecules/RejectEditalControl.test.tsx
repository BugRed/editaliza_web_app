import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RejectEditalControl from "@/shared/components/molecules/RejectEditalControl";

describe("RejectEditalControl", () => {
  it("dispensar com motivo mostra o resultado e permite desfazer", async () => {
    render(<RejectEditalControl />);
    await userEvent.click(screen.getByRole("button", { name: "Não tenho interesse" }));
    await userEvent.click(screen.getByRole("radio", { name: "O prazo é curto demais" }));
    await userEvent.click(screen.getByRole("button", { name: "Dispensar edital" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("O prazo é curto demais");

    await userEvent.click(screen.getByRole("button", { name: "Desfazer" }));
    expect(screen.getByRole("button", { name: "Não tenho interesse" })).toBeInTheDocument();
  });

  it("cancelar não registra nada", async () => {
    render(<RejectEditalControl />);
    await userEvent.click(screen.getByRole("button", { name: "Não tenho interesse" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
