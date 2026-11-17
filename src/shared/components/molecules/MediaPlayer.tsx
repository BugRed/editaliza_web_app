"use client";

import { getMediaSource } from "@/shared/lib/media";

type MediaPlayerProps = { url: string; title: string; poster?: string };

// O link passa por getMediaSource: só http(s) ou arquivo do próprio site chega ao src.
export default function MediaPlayer({ url, title, poster }: MediaPlayerProps) {
  const source = getMediaSource(url);

  if (!source) {
    return (
      <p className="rounded-xl border border-dashed border-(--border-subtle) bg-(--background) p-4 text-sm text-(--text-subtle)">
        Esta obra ainda não tem mídia para reproduzir.
      </p>
    );
  }

  if (source.type === "youtube" || source.type === "vimeo") {
    return (
      <iframe
        src={source.src}
        title={title}
        loading="lazy"
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-xl border border-(--border-subtle) bg-(--scrim)"
      />
    );
  }

  if (source.type === "video-file") {
    return (
      <video controls preload="metadata" poster={poster} aria-label={title} className="aspect-video w-full rounded-xl bg-(--scrim)">
        <source src={source.src} />
        Seu navegador não reproduz este vídeo.
      </video>
    );
  }

  return (
    <audio controls preload="metadata" aria-label={title} className="w-full">
      <source src={source.src} />
      Seu navegador não reproduz este áudio.
    </audio>
  );
}
