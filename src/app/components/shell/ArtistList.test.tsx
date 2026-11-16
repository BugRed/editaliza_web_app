import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ArtistList from "@/app/components/shell/ArtistList";
import type { ArtistProfile } from "@/app/lib/user-profiles";

const artists = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Artista ${i + 1}`, handle: `@a${i + 1}`, city: "Recife", state: "PE", tags: ["Pintura"], avatarUrl: "/a.jpg" }) as unknown as ArtistProfile);

describe("ArtistList (recursiva)", () => {
  it("mostra no máximo 4 perfis e o 'Ver mais' com quantos faltam", () => {
    render(<ArtistList artists={artists(10)} />);
    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Ver mais (6)" })).toBeInTheDocument();
  });

  it("cada 'Ver mais' revela os próximos 4 e o nível seguinte traz o seu próprio botão", async () => {
    render(<ArtistList artists={artists(10)} />);

    await userEvent.click(screen.getByRole("button", { name: "Ver mais (6)" }));
    expect(screen.getAllByRole("link")).toHaveLength(8);
    expect(screen.getByRole("button", { name: "Ver mais (2)" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Ver mais (2)" }));
    expect(screen.getAllByRole("link")).toHaveLength(10);
    expect(screen.queryByRole("button", { name: /Ver mais/ })).not.toBeInTheDocument();
  });

  it("mantém a ordem dos perfis ao longo dos níveis", async () => {
    render(<ArtistList artists={artists(6)} />);
    await userEvent.click(screen.getByRole("button", { name: /Ver mais/ }));
    expect(screen.getAllByRole("link").map((a) => a.textContent?.match(/Artista \d+/)?.[0])).toEqual([
      "Artista 1", "Artista 2", "Artista 3", "Artista 4", "Artista 5", "Artista 6",
    ]);
  });

  it.each([0, 1, 4])("com %s perfis não há 'Ver mais'", (n) => {
    render(<ArtistList artists={artists(n)} />);
    expect(screen.queryByRole("button", { name: /Ver mais/ })).not.toBeInTheDocument();
  });

  it("com 5 perfis o 'Ver mais' mostra 1 restante", () => {
    render(<ArtistList artists={artists(5)} />);
    expect(screen.getByRole("button", { name: "Ver mais (1)" })).toBeInTheDocument();
  });

  it("respeita um tamanho de página diferente", () => {
    render(<ArtistList artists={artists(7)} pageSize={2} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Ver mais (5)" })).toBeInTheDocument();
  });
});
