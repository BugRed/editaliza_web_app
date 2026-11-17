import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditalDetailView from "@/shared/components/organisms/EditalDetailView";
import type { IEdital } from "@/app/types/Edital";

const edital = {
  id: 9999,
  title: "Chamada de Pintura",
  description: "Apoio a pintores independentes.",
  listTags: [],
  endDate: null,
  publishDate: null,
  requiredLanguages: ["Pintura"],
  plainSummary: { whatIsIt: "Resumo próprio", whoCanApply: ["Quem pinta"], benefits: ["Bolsa"], extraTags: [] },
} as unknown as IEdital;

function renderView(overrides: Partial<IEdital> = {}, saved = false, onToggleSave = vi.fn()) {
  render(
    <EditalDetailView edital={{ ...edital, ...overrides }} proposerName="Instituto Sol" proposerHref="/empresas/1" saved={saved} onToggleSave={onToggleSave} />
  );
  return onToggleSave;
}

describe("EditalDetailView", () => {
  it("mostra título, organização e os requisitos estruturados", () => {
    renderView();
    expect(screen.getByRole("heading", { name: "Chamada de Pintura" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instituto Sol" })).toHaveAttribute("href", "/empresas/1");
    expect(screen.getByText("Linguagens obrigatórias")).toBeInTheDocument();
  });

  it("edital sem requisitos estruturados avisa em vez de mostrar lista vazia", () => {
    renderView({ requiredLanguages: [] });
    expect(screen.getByText(/ainda não tem requisitos estruturados/)).toBeInTheDocument();
  });

  it("edital encerrado avisa; resumo próprio não é marcado como provisório", () => {
    renderView({ endDate: new Date("2020-01-01") });
    expect(screen.getByRole("alert")).toHaveTextContent("Inscrições encerradas");
    expect(screen.queryByText(/Resumo provisório/)).not.toBeInTheDocument();
  });

  it("sem resumo próprio, avisa que o resumo é provisório", () => {
    renderView({ plainSummary: null });
    expect(screen.getByRole("note")).toHaveTextContent("Resumo provisório");
  });

  it("salvar chama a ação e o estado fica exposto no botão", async () => {
    const onToggle = renderView({}, true);
    const button = screen.getByRole("button", { name: /Salvo nos seus editais/ });
    expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
