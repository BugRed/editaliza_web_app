import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RejectEditalDialog from "@/shared/components/molecules/RejectEditalDialog";

describe("RejectEditalDialog", () => {
  it("sem motivo escolhido mostra o erro e não confirma", async () => {
    const onConfirm = vi.fn();
    render(<RejectEditalDialog onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Dispensar edital" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha o motivo");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirma com o motivo escolhido", async () => {
    const onConfirm = vi.fn();
    render(<RejectEditalDialog onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole("radio", { name: "Já participei" }));
    await userEvent.click(screen.getByRole("button", { name: "Dispensar edital" }));
    expect(onConfirm).toHaveBeenCalledWith("DONE", "");
  });

  it("'outro motivo' abre o campo de texto e exige a frase", async () => {
    const onConfirm = vi.fn();
    render(<RejectEditalDialog onConfirm={onConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole("radio", { name: "Outro motivo" }));
    await userEvent.click(screen.getByRole("button", { name: "Dispensar edital" }));
    expect(screen.getByRole("alert")).toHaveTextContent("poucas palavras");

    await userEvent.type(screen.getByLabelText("Conte o motivo"), "Fica longe");
    await userEvent.click(screen.getByRole("button", { name: "Dispensar edital" }));
    expect(onConfirm).toHaveBeenCalledWith("OTHER", "Fica longe");
  });
});
