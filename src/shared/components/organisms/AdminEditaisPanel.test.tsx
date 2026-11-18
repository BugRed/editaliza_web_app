import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AdminEditaisPanel from "@/shared/components/organisms/AdminEditaisPanel";

async function open(title: RegExp) {
  await userEvent.click(screen.getByRole("button", { name: title }));
}

describe("AdminEditaisPanel", () => {
  it("lista os editais com o status de cada um", () => {
    render(<AdminEditaisPanel />);
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("Em revisão")).toBeInTheDocument();
    expect(screen.getByText("Falhou")).toBeInTheDocument();
  });

  it("edital com falha mostra o motivo e permite tentar de novo", async () => {
    render(<AdminEditaisPanel />);
    await open(/Edital de Música Caruaru/);
    expect(screen.getByRole("alert")).toHaveTextContent("imagem escaneada");
    await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(screen.getByRole("status")).toHaveTextContent("extraindo os requisitos");
  });

  it("só publica depois de resolver todas as pendências da revisão", async () => {
    render(<AdminEditaisPanel />);
    await open(/Festival de Dança/);
    const publish = screen.getByRole("button", { name: /Aprovar e publicar/ });
    expect(publish).toBeDisabled();

    await userEvent.selectOptions(screen.getByLabelText("Papel da linguagem", { selector: "#req-r2-role" }), "SUPPORT");
    expect(publish).toBeDisabled();

    await userEvent.click(screen.getAllByLabelText("Conferi com o documento")[1]);
    expect(publish).toBeDisabled(); // sobra o território obrigatório sem trecho

    await userEvent.selectOptions(screen.getByLabelText("Força do requisito", { selector: "#req-r3-strength" }), "preference");
    expect(publish).toBeEnabled();

    await userEvent.click(publish);
    expect(screen.getAllByText("Publicado").length).toBeGreaterThan(1);
  });

  it("enviar um PDF cria um item em processamento", async () => {
    render(<AdminEditaisPanel />);
    const file = new File(["x"], "novo-edital.pdf", { type: "application/pdf" });
    await userEvent.upload(screen.getByLabelText(/Enviar PDF/), file);
    expect(screen.getByRole("status")).toHaveTextContent("extraindo os requisitos");
    expect(screen.getByRole("button", { name: /novo-edital/ })).toBeInTheDocument();
  });
});
