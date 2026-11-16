import { render, screen } from "@testing-library/react";

import MediaPlayer from "@/app/components/profile/MediaPlayer";

describe("MediaPlayer", () => {
  it("link inválido ou perigoso não vira src: mostra aviso", () => {
    render(<MediaPlayer url="javascript:alert(1)" title="x" />);
    expect(screen.getByText(/ainda não tem mídia/)).toBeInTheDocument();
  });

  it("YouTube vira iframe de embed com título acessível", () => {
    render(<MediaPlayer url="https://youtu.be/abc123" title="Meu vídeo" />);
    const frame = screen.getByTitle("Meu vídeo");
    expect(frame).toHaveAttribute("src", "https://www.youtube.com/embed/abc123");
  });
});
