import { getMediaSource, isPlayableKind, isWorkKind } from "@/shared/lib/media";
import { moveItem } from "@/shared/lib/reorder";

describe("getMediaSource", () => {
  it("reconhece YouTube (watch e youtu.be) e Vimeo como embed", () => {
    expect(getMediaSource("https://www.youtube.com/watch?v=abc123")).toEqual({ type: "youtube", src: "https://www.youtube.com/embed/abc123" });
    expect(getMediaSource("https://youtu.be/abc123")).toEqual({ type: "youtube", src: "https://www.youtube.com/embed/abc123" });
    expect(getMediaSource("https://vimeo.com/123456")).toEqual({ type: "vimeo", src: "https://player.vimeo.com/video/123456" });
  });

  it("arquivo de vídeo e de áudio, com ou sem query", () => {
    expect(getMediaSource("https://x.com/a.mp4?t=1")).toEqual({ type: "video-file", src: "https://x.com/a.mp4?t=1" });
    expect(getMediaSource("https://x.com/a.MP3")).toEqual({ type: "audio-file", src: "https://x.com/a.MP3" });
  });

  it("aceita arquivo do próprio site", () => {
    expect(getMediaSource("/media/a.mp4")).toEqual({ type: "video-file", src: "/media/a.mp4" });
    expect(getMediaSource("/media/a.mp3")).toEqual({ type: "audio-file", src: "/media/a.mp3" });
  });

  it("recusa protocolos perigosos, caminho relativo, vazio e link sem mídia reconhecível", () => {
    expect(getMediaSource("javascript:alert(1)")).toBeNull();
    expect(getMediaSource("data:text/html,<script>")).toBeNull();
    expect(getMediaSource("//evil.com/a.mp4")).toBeNull();
    expect(getMediaSource("/media/pagina")).toBeNull();
    expect(getMediaSource("   ")).toBeNull();
    expect(getMediaSource(undefined)).toBeNull();
    expect(getMediaSource("https://exemplo.com/pagina")).toBeNull();
    expect(getMediaSource("https://youtube.com/watch")).toBeNull();
    expect(getMediaSource("https://vimeo.com/abc")).toBeNull();
  });
});

describe("tipos de obra", () => {
  it("valida o tipo e diz quais tocam", () => {
    expect(isWorkKind("VIDEO")).toBe(true);
    expect(isWorkKind("video")).toBe(false);
    expect(isPlayableKind("AUDIO")).toBe(true);
    expect(isPlayableKind("IMAGEM")).toBe(false);
  });
});

describe("moveItem", () => {
  it("sobe e desce um item sem mutar a lista original", () => {
    const list = ["a", "b", "c"];
    expect(moveItem(list, 1, -1)).toEqual(["b", "a", "c"]);
    expect(moveItem(list, 1, 1)).toEqual(["a", "c", "b"]);
    expect(list).toEqual(["a", "b", "c"]);
  });

  it("nos limites não muda nada", () => {
    expect(moveItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], 1, 1)).toEqual(["a", "b"]);
    expect(moveItem(["a"], 5, -1)).toEqual(["a"]);
  });
});
