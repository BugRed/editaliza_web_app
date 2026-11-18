import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WorkGallery from "@/shared/components/organisms/WorkGallery";
import type { ArtWork } from "@/app/lib/user-profiles";

const base = { category: "Pintura", year: "2025", description: "Texto curto.", imageUrl: "/c.jpg" };
const works: ArtWork[] = [
  { ...base, id: "1", title: "Tela", kind: "IMAGEM", technique: "Óleo", dimensions: "10 × 10 cm", tags: ["a", "b", "c", "d"] },
  { ...base, id: "2", title: "Filme", kind: "VIDEO", mediaUrl: "/media/a.mp4" },
  { ...base, id: "3", title: "Canção", kind: "AUDIO", mediaUrl: "/media/a.mp3" },
];

describe("WorkGallery", () => {
  it("mostra a contagem por tipo e filtra ao escolher a aba", async () => {
    render(<WorkGallery works={works} />);
    expect(screen.getByRole("tab", { name: /Vídeos 1/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /Áudios/ }));

    expect(screen.getByText("Canção")).toBeInTheDocument();
    expect(screen.queryByText("Tela")).not.toBeInTheDocument();
  });

  it("aba sem obras avisa em vez de ficar em branco", async () => {
    render(<WorkGallery works={[works[0]]} />);
    await userEvent.click(screen.getByRole("tab", { name: /Vídeos/ }));
    expect(screen.getByText(/Nenhuma obra neste tipo/)).toBeInTheDocument();
  });

  it("o card mostra técnica, dimensões e só 3 temas com contador do resto", () => {
    render(<WorkGallery works={[works[0]]} />);
    expect(screen.getByText("Óleo")).toBeInTheDocument();
    expect(screen.getByText("10 × 10 cm")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("vídeo abre com player, Escape fecha", async () => {
    const { container } = render(<WorkGallery works={works} />);
    await userEvent.click(screen.getByRole("button", { name: "Abrir Filme" }));
    expect(screen.getByRole("dialog", { name: "Filme" })).toBeInTheDocument();
    expect(container.ownerDocument.querySelector("video")).not.toBeNull();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("áudio abre com player de áudio, não com imagem", async () => {
    const { container } = render(<WorkGallery works={works} />);
    await userEvent.click(screen.getByRole("button", { name: "Abrir Canção" }));
    expect(container.ownerDocument.querySelector("audio")).not.toBeNull();
  });

  it("preserva a ordem recebida", () => {
    render(<WorkGallery works={[works[2], works[0]]} />);
    const titles = screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent);
    expect(titles).toEqual(["Canção", "Tela"]);
  });
});
