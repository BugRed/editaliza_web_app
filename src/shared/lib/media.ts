export const WORK_KINDS = ["IMAGEM", "FOTOGRAFIA", "VIDEO", "AUDIO", "TEXTO", "OUTRO"] as const;

export type WorkKind = (typeof WORK_KINDS)[number];

export const WORK_KIND_LABELS: Record<WorkKind, string> = {
  IMAGEM: "Imagem",
  FOTOGRAFIA: "Fotografia",
  VIDEO: "Vídeo",
  AUDIO: "Áudio",
  TEXTO: "Texto",
  OUTRO: "Outro",
};

export function isWorkKind(value: unknown): value is WorkKind {
  return typeof value === "string" && (WORK_KINDS as readonly string[]).includes(value);
}

/** Obras que se reproduzem (têm player) em vez de só se contemplar. */
export function isPlayableKind(kind: WorkKind): boolean {
  return kind === "VIDEO" || kind === "AUDIO";
}

export type MediaSource =
  | { type: "youtube"; src: string }
  | { type: "vimeo"; src: string }
  | { type: "video-file"; src: string }
  | { type: "audio-file"; src: string };

const VIDEO_FILE = /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i;
const AUDIO_FILE = /\.(mp3|wav|ogg|oga|m4a|aac|flac)(\?.*)?$/i;

function parseUrl(value: string, base?: string): URL | null {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
}

function fileSource(value: string, pathname: string): MediaSource | null {
  if (VIDEO_FILE.test(pathname)) return { type: "video-file", src: value };
  if (AUDIO_FILE.test(pathname)) return { type: "audio-file", src: value };
  return null;
}

/**
 * Decide como tocar um link de mídia. Só http(s) ou arquivo do próprio site (/media/x.mp4) entram:
 * `javascript:`, `data:` e `//host` viram null, porque o resultado vai para src de iframe/vídeo/áudio.
 */
export function getMediaSource(rawUrl: string | undefined | null): MediaSource | null {
  const value = (rawUrl ?? "").trim();
  if (!value) return null;

  if (value.startsWith("/")) {
    if (value.startsWith("//")) return null;
    const local = parseUrl(value, "http://local.invalid");
    return local ? fileSource(value, local.pathname) : null;
  }

  const url = parseUrl(value);
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) return null;

  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return id ? { type: "youtube", src: `https://www.youtube.com/embed/${id}` } : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");
    return id ? { type: "youtube", src: `https://www.youtube.com/embed/${id}` } : null;
  }
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? { type: "vimeo", src: `https://player.vimeo.com/video/${id}` } : null;
  }
  return fileSource(value, url.pathname);
}
