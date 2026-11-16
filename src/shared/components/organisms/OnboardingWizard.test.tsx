import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OnboardingWizard } from "@/shared/components/organisms/OnboardingWizard";

describe("OnboardingWizard", () => {
  it("dá para concluir sem preencher nada: nenhum campo é obrigatório", async () => {
    const onFinish = vi.fn();
    render(<OnboardingWizard onFinish={onFinish} />);

    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await userEvent.click(screen.getByRole("button", { name: "Concluir" }));

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Perfil criado" })).toBeInTheDocument();
  });

  it("voltar leva à etapa anterior e fica desabilitado na primeira", async () => {
    render(<OnboardingWizard />);
    expect(screen.getByRole("button", { name: "Voltar" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("2. Linguagens")).toHaveAttribute("aria-current", "step");

    await userEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByText("1. Identidade")).toHaveAttribute("aria-current", "step");
  });
});
