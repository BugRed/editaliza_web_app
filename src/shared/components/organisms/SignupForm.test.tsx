import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SignupForm } from "@/shared/components/organisms/SignupForm";

describe("SignupForm", () => {
  it("campos inválidos mostram erro e não enviam", async () => {
    const onSubmit = vi.fn();
    render(<SignupForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(screen.getByLabelText("E-mail")).toBeInvalid();
    expect(screen.getByLabelText("Senha")).toBeInvalid();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sem aceitar o tratamento de dados não envia, mesmo com o resto válido", async () => {
    const onSubmit = vi.fn();
    render(<SignupForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha1234");

    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/aceite/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("dados válidos e consentimento enviam e-mail sem espaços e a senha", async () => {
    const onSubmit = vi.fn();
    render(<SignupForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("E-mail"), " ana@exemplo.com ");
    await userEvent.type(screen.getByLabelText("Senha"), "senha1234");
    await userEvent.click(screen.getByRole("checkbox"));

    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(onSubmit).toHaveBeenCalledWith("ana@exemplo.com", "senha1234");
  });
});
