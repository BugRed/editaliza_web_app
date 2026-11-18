import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TrajectoryEditor from "@/shared/components/organisms/TrajectoryEditor";

describe("TrajectoryEditor", () => {
  it("começa com o estágio de exemplo e o resumo conta a experiência", () => {
    render(<TrajectoryEditor />);
    expect(screen.getByText("Estágio em produção cultural")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 experiência(s), 1 verificada(s)");
  });

  it("recusa experiência sem título e sem início, mostrando o motivo", async () => {
    render(<TrajectoryEditor />);
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("título");

    await userEvent.type(screen.getByLabelText("Título"), "Oficina de gravura");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("começou");
  });

  it("adiciona uma experiência válida em andamento e limpa o formulário", async () => {
    render(<TrajectoryEditor />);
    await userEvent.type(screen.getByLabelText("Título"), "Oficina de gravura");
    await userEvent.type(screen.getByLabelText("Início"), "2026-01-10");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    const list = screen.getByRole("list", { name: "Experiências" });
    expect(within(list).getByText("Oficina de gravura")).toBeInTheDocument();
    expect(within(list).getByText(/em andamento/)).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("");
  });

  it("remover a última experiência mostra o estado vazio", async () => {
    render(<TrajectoryEditor />);
    await userEvent.click(screen.getByRole("button", { name: "Remover Estágio em produção cultural" }));
    expect(screen.getByText(/Sem trajetória por enquanto/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Nenhuma experiência registrada");
  });
});
