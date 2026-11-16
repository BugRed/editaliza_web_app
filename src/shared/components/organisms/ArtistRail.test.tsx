import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ArtistRail, filterArtists, type RailArtist } from "@/shared/components/organisms/ArtistRail";

const artists: RailArtist[] = [
  { id: 1, name: "Maria Exemplo", handle: "@maria", city: "Recife, PE", tags: ["Artes visuais"] },
  { id: 2, name: "João Exemplo", handle: "@joao", city: "Olinda, PE", tags: ["Música"] },
];

describe("filterArtists", () => {
  it("busca por nome, handle, cidade e tag sem diferenciar maiúsculas", () => {
    expect(filterArtists(artists, "MARIA")).toHaveLength(1);
    expect(filterArtists(artists, "@joao")).toHaveLength(1);
    expect(filterArtists(artists, "olinda")).toHaveLength(1);
    expect(filterArtists(artists, "visuais")).toHaveLength(1);
    expect(filterArtists(artists, "  ")).toHaveLength(2);
  });
});

describe("ArtistRail", () => {
  it("filtra a lista ao digitar e avisa quando não há resultado", async () => {
    render(<ArtistRail artists={artists} hrefFor={(id) => `/a/${id}`} />);
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar outros usuários" }), "zzz");

    expect(screen.getByText(/Nenhum perfil encontrado/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Resultados da busca" })).toBeInTheDocument();
  });

  it("cada artista leva ao seu perfil", () => {
    render(<ArtistRail artists={artists} hrefFor={(id) => `/a/${id}`} />);
    expect(screen.getByRole("link", { name: /Maria Exemplo/ })).toHaveAttribute("href", "/a/1");
  });
});
