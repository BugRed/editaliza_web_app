import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProposerProfileView from "@/shared/components/organisms/ProposerProfileView";
import type { ProposerProfile } from "@/app/hooks/useSocialStore";
import type { IEdital } from "@/app/types/Edital";

const proposer: ProposerProfile = {
  id: 101, name: "Empresa A", handle: "@a", email: "a@a.com", imgUrl: "/a.jpg", bio: "bio", city: "SP", state: "SP",
  cnpj: "11222333000144", userType: "PROPOSER", listEdital: [],
};
const edital = (id: number, proposerId: number, endDate: string): IEdital =>
  ({ id, title: `Edital ${id}`, proposer: proposerId, endDate, listTags: [], imgCoverUrl: "" }) as unknown as IEdital;

describe("ProposerProfileView", () => {
  it("lista só os editais publicados por este proponente", () => {
    render(
      <ProposerProfileView
        proposer={proposer}
        editais={[edital(1, 101, "2099-01-01"), edital(2, 102, "2099-01-01")]}
        isOwnProfile
        onOpenEdital={vi.fn()}
      />
    );
    expect(screen.getByRole("heading", { name: "Editais publicados (1)" })).toBeInTheDocument();
    expect(screen.getByText("Edital 1")).toBeInTheDocument();
    expect(screen.queryByText("Edital 2")).not.toBeInTheDocument();
    expect(screen.getByText("1 edital publicado")).toBeInTheDocument();
  });

  it("marca encerrado e abre o resumo ao clicar", async () => {
    const onOpen = vi.fn();
    render(<ProposerProfileView proposer={proposer} editais={[edital(1, 101, "2020-01-01")]} isOwnProfile onOpenEdital={onOpen} />);
    expect(screen.getByText("Encerrado")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Abrir resumo de Edital 1" }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it("sem editais mostra o vazio certo para o dono e para visitante", () => {
    const { rerender } = render(<ProposerProfileView proposer={proposer} editais={[]} isOwnProfile onOpenEdital={vi.fn()} />);
    expect(screen.getByText("Você ainda não publicou nenhum edital.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Publicar novo edital/ })).toBeInTheDocument();

    rerender(<ProposerProfileView proposer={proposer} editais={[]} isOwnProfile={false} onOpenEdital={vi.fn()} />);
    expect(screen.getByText("Esta empresa ainda não publicou editais.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Publicar novo edital/ })).not.toBeInTheDocument();
  });
});
