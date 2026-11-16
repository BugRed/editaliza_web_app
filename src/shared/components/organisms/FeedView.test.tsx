import { render, screen } from "@testing-library/react";

import { FeedView } from "@/shared/components/organisms/FeedView";

const card = { id: 1, title: "Edital A", organization: "Secult", deadlineLabel: "Até 30/12", tags: [] };

describe("FeedView", () => {
  it("lista os editais", () => {
    render(<FeedView editais={[card]} searchAction="/feed" />);
    expect(screen.getByRole("list", { name: "Lista de editais" })).toHaveTextContent("Edital A");
  });

  it("sem editais e sem busca, convida a voltar depois", () => {
    render(<FeedView editais={[]} searchAction="/feed" />);
    expect(screen.getByRole("heading", { name: "Ainda não há editais" })).toBeInTheDocument();
  });

  it("sem resultado para a busca, diz isso e mantém o termo no campo", () => {
    render(<FeedView editais={[]} query="xyz" searchAction="/feed" />);
    expect(screen.getByRole("heading", { name: "Nenhum edital para essa busca" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("xyz");
  });

  it("usa detailHref quando informado", () => {
    render(<FeedView editais={[card]} searchAction="/feed" detailHref={(id) => `/editais/${id}`} />);
    expect(screen.getByRole("link", { name: "Edital A" })).toHaveAttribute("href", "/editais/1");
  });
});
