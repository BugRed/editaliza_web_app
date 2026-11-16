import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "@/shared/components/organisms/LoginForm";

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
  await userEvent.type(screen.getByLabelText("Senha"), "senha1234");
  await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("LoginForm", () => {
  it("envia as credenciais e avança no sucesso", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: true });
    const onSuccess = vi.fn();
    render(<LoginForm onSubmit={onSubmit} onSuccess={onSuccess} />);

    await fillAndSubmit();

    expect(onSubmit).toHaveBeenCalledWith("ana@exemplo.com", "senha1234");
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("mostra a mensagem do servidor e não avança na falha", async () => {
    const onSuccess = vi.fn();
    render(<LoginForm onSubmit={vi.fn().mockResolvedValue({ success: false, message: "Senha incorreta" })} onSuccess={onSuccess} />);

    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent("Senha incorreta");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("erro inesperado vira mensagem amigável e libera o botão", async () => {
    render(<LoginForm onSubmit={vi.fn().mockRejectedValue(new Error("boom"))} onSuccess={vi.fn()} />);

    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent(/não foi possível entrar/i);
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });
});
