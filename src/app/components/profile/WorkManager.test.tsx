import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WorkManager from "@/app/components/profile/WorkManager";
import type { ArtistProfile } from "@/app/lib/user-profiles";

const store = {
  addArtWorkToCurrentProfile: vi.fn(),
  removeArtWorkFromCurrentProfile: vi.fn(),
  moveArtWorkOfCurrentProfile: vi.fn(),
};
vi.mock("@/app/hooks/useSocialStore", () => ({ useSocialStore: () => store }));

const work = (id: string, title: string) => ({ id, title, category: "Pintura", year: "2025", description: "d", imageUrl: "/c.jpg" });
const profile = { works: [work("1", "Primeira"), work("2", "Segunda"), work("3", "Terceira")] } as unknown as ArtistProfile;

function renderManager() {
  return render(<WorkManager profile={profile} availableCategories={["Pintura", "Música"]} />);
}

beforeEach(() => vi.clearAllMocks());

describe("WorkManager: ordem da galeria", () => {
  it("descer e subir chamam a store com o sentido certo", async () => {
    renderManager();
    await userEvent.click(screen.getByRole("button", { name: "Descer Primeira na galeria" }));
    await userEvent.click(screen.getByRole("button", { name: "Subir Terceira na galeria" }));
    expect(store.moveArtWorkOfCurrentProfile).toHaveBeenNthCalledWith(1, "1", 1);
    expect(store.moveArtWorkOfCurrentProfile).toHaveBeenNthCalledWith(2, "3", -1);
  });

  it("a primeira não sobe e a última não desce", () => {
    renderManager();
    expect(screen.getByRole("button", { name: "Subir Primeira na galeria" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Descer Terceira na galeria" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Descer Primeira na galeria" })).toBeEnabled();
  });
});

describe("WorkManager: nova obra", () => {
  it("envia técnica, dimensões, texto, temas (sem repetição) e tipo", async () => {
    renderManager();
    await userEvent.type(screen.getByLabelText("Título"), "Maré");
    await userEvent.type(screen.getByLabelText("Técnica"), "Óleo sobre tela");
    await userEvent.type(screen.getByLabelText("Dimensões"), "120 × 150 cm");
    await userEvent.type(screen.getByLabelText(/Texto curto/), "Uma maré de ocre.");
    await userEvent.type(screen.getByLabelText(/Temas/), "mar, cor, mar");
    await userEvent.selectOptions(screen.getByLabelText("Tipo de mídia"), "FOTOGRAFIA");

    await userEvent.click(screen.getByRole("button", { name: /Publicar trabalho/ }));

    expect(store.addArtWorkToCurrentProfile).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Maré", kind: "FOTOGRAFIA", technique: "Óleo sobre tela", dimensions: "120 × 150 cm", description: "Uma maré de ocre.", tags: ["mar", "cor"], mediaUrl: "" })
    );
  });

  it("vídeo exige link tocável: com link perigoso não publica e explica", async () => {
    renderManager();
    await userEvent.type(screen.getByLabelText("Título"), "Filme");
    await userEvent.selectOptions(screen.getByLabelText("Tipo de mídia"), "VIDEO");
    await userEvent.type(screen.getByLabelText(/Link do vídeo/), "javascript:alert(1)");

    await userEvent.click(screen.getByRole("button", { name: /Publicar trabalho/ }));

    expect(store.addArtWorkToCurrentProfile).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/YouTube, Vimeo/);
  });

  it("vídeo com link válido publica e guarda a mídia", async () => {
    renderManager();
    await userEvent.type(screen.getByLabelText("Título"), "Filme");
    await userEvent.selectOptions(screen.getByLabelText("Tipo de mídia"), "VIDEO");
    await userEvent.type(screen.getByLabelText(/Link do vídeo/), "https://youtu.be/abc123");

    await userEvent.click(screen.getByRole("button", { name: /Publicar trabalho/ }));

    expect(store.addArtWorkToCurrentProfile).toHaveBeenCalledWith(expect.objectContaining({ kind: "VIDEO", mediaUrl: "https://youtu.be/abc123" }));
  });

  it("o campo de link só existe para vídeo e áudio", async () => {
    renderManager();
    expect(screen.queryByLabelText(/Link do/)).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Tipo de mídia"), "AUDIO");
    expect(screen.getByLabelText(/Link do áudio/)).toBeInTheDocument();
  });
});
