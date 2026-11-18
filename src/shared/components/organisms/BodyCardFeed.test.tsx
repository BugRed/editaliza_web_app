import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import BodyCardFeed from "@/shared/components/organisms/BodyCardFeed";

vi.mock("@/app/hooks/useSocialStore", () => ({
  useSocialStore: () => ({ isEditalSaved: () => false, toggleSaveEdital: vi.fn(), isEditalLiked: () => false, toggleLikeEdital: vi.fn() }),
}));

function renderCard(onOpenSummary?: () => void, proposerLink = "") {
  return render(
    <BodyCardFeed
      editalId={1}
      percent="Aberto"
      colorPercent="#0E7C86"
      coverImage="/c.jpg"
      title="Edital X"
      description="Descrição"
      proposer="Empresa A"
      proposerLink={proposerLink}
      date={null}
      tags={[]}
      buttomSubmitLink="https://x.com"
      onOpenSummary={onOpenSummary}
    />
  );
}

describe("BodyCardFeed: abrir o resumo", () => {
  it("clicar na imagem, no título e em 'Inscrever-se' abre o mesmo resumo", async () => {
    const open = vi.fn();
    renderCard(open);

    await userEvent.click(screen.getByRole("button", { name: "Ver resumo de Edital X" }));
    await userEvent.click(screen.getByRole("button", { name: "Edital X" }));
    await userEvent.click(screen.getByRole("button", { name: /Inscrever-se/ }));

    expect(open).toHaveBeenCalledTimes(3);
  });

  it("curtir, salvar e compartilhar NÃO abrem o resumo (o card inteiro não é clicável)", async () => {
    const open = vi.fn();
    renderCard(open);

    await userEvent.click(screen.getByRole("button", { name: /Curtir edital/ }));
    await userEvent.click(screen.getByRole("button", { name: /Salvar|Remover/ }));
    await userEvent.click(screen.getByRole("button", { name: /Compartilhar/ }));
    await userEvent.click(screen.getByRole("button", { name: "Mais opções" }));

    expect(open).not.toHaveBeenCalled();
  });

  it("sem onOpenSummary a imagem e o título não viram botão", () => {
    renderCard();
    expect(screen.queryByRole("button", { name: "Ver resumo de Edital X" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Edital X" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edital X" })).not.toBeInTheDocument();
  });

  it("não há link nem botão envolvendo o card todo", () => {
    const { container } = renderCard(vi.fn());
    const article = container.querySelector("article") as HTMLElement;
    expect(article.closest("a, button")).toBeNull();
  });

  it("o nome da empresa leva à página dela e não abre o resumo", async () => {
    const open = vi.fn();
    renderCard(open, "/empresas/101");

    const link = screen.getByRole("link", { name: "Empresa A" });
    expect(link).toHaveAttribute("href", "/empresas/101");
    link.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(link);

    expect(open).not.toHaveBeenCalled();
  });

  it("sem dono conhecido o nome é só texto", () => {
    renderCard(vi.fn(), "");
    expect(screen.queryByRole("link", { name: "Empresa A" })).not.toBeInTheDocument();
    expect(screen.getByText("Empresa A")).toBeInTheDocument();
  });

  it("a data não repete num balão: aparece uma vez só", () => {
    render(
      <BodyCardFeed
        editalId={1} percent="Aberto" colorPercent="#0E7C86" title="T" proposer="P" proposerLink="" tags={[]}
        date={new Date("2026-11-01T12:00:00Z")}
      />
    );
    expect(screen.getAllByText("01/11/2026")).toHaveLength(1);
  });
});
