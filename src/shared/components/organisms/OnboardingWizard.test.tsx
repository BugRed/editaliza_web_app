import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import OnboardingWizard from "@/shared/components/organisms/OnboardingWizard";

describe("OnboardingWizard", () => {
  it("nenhum campo é obrigatório: dá para pular todas as etapas e concluir", async () => {
    render(<OnboardingWizard />);
    for (let i = 0; i < 3; i++) await userEvent.click(screen.getByRole("button", { name: "Pular etapa" }));
    await userEvent.click(screen.getByRole("button", { name: "Concluir" }));

    expect(screen.getByRole("status")).toHaveTextContent("0 de 11 campos");
    expect(screen.getByRole("status")).toHaveTextContent("nunca como zero");
    expect(screen.getByRole("link", { name: "Ir para o feed" })).toHaveAttribute("href", "/");
  });

  it("o que foi preenchido sai da lista do que falta", async () => {
    render(<OnboardingWizard />);
    await userEvent.type(screen.getByLabelText("Nome artístico"), "Clara");
    for (let i = 0; i < 3; i++) await userEvent.click(screen.getByRole("button", { name: i === 0 ? "Continuar" : "Pular etapa" }));
    const travel = within(screen.getByRole("group", { name: "Pode viajar para se apresentar?" }));
    await userEvent.click(travel.getByRole("radio", { name: "Não" }));
    await userEvent.click(screen.getByRole("button", { name: "Concluir" }));

    expect(screen.getByRole("status")).toHaveTextContent("2 de 11 campos");
    expect(screen.queryByText("Nome artístico")).not.toBeInTheDocument();
    expect(screen.getByText("Biografia")).toBeInTheDocument();
  });

  it("voltar fica desabilitado na primeira etapa", () => {
    render(<OnboardingWizard />);
    expect(screen.getByRole("button", { name: "Voltar" })).toBeDisabled();
  });
});
