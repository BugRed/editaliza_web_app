"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import type { ArtistProfile } from "@/app/lib/user-profiles";
import { getMediaSource, isPlayableKind, WORK_KIND_LABELS, WORK_KINDS, type WorkKind } from "@/shared/lib/media";
import { parseTagList } from "@/shared/lib/works";

const PRESET_COVERS = [
  { url: "/images/art_pintura_tela_1794791580838.jpg", label: "Pintura em tela" },
  { url: "/images/art_escultura_galeria_1794791581583.jpg", label: "Escultura em galeria" },
  { url: "/images/art_teatro_palco_1794791582532.jpg", label: "Cena de teatro" },
  { url: "/images/edital_musica_1794791580539.jpg", label: "Show de música" },
];

const FIELD =
  "w-full px-3.5 py-2.5 rounded-xl bg-(--bg-card) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg) focus:border-(--primary-fg)";
const DESCRIPTION_LIMIT = 280;

interface WorkManagerProps {
  profile: ArtistProfile;
  availableCategories: string[];
}

export default function WorkManager({ profile, availableCategories }: WorkManagerProps) {
  const { addArtWorkToCurrentProfile, removeArtWorkFromCurrentProfile, moveArtWorkOfCurrentProfile } = useSocialStore();

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<WorkKind>("IMAGEM");
  const [category, setCategory] = useState(availableCategories[0] ?? "Pintura");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [technique, setTechnique] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [cover, setCover] = useState(PRESET_COVERS[0].url);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const playable = isPlayableKind(kind);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!title.trim()) return;
    if (playable && !getMediaSource(mediaUrl)) {
      setError("Cole um link de YouTube, Vimeo ou de um arquivo (.mp4, .webm, .mp3, .wav…).");
      return;
    }
    setError(null);
    await addArtWorkToCurrentProfile({
      title: title.trim(),
      kind,
      category,
      year: year.trim() || String(new Date().getFullYear()),
      technique: technique.trim(),
      dimensions: dimensions.trim(),
      description: description.trim() || "Trabalho artístico autoral.",
      tags: parseTagList(tagsText),
      mediaUrl: playable ? mediaUrl.trim() : "",
      imageUrl: cover,
    });
    setTitle("");
    setTechnique("");
    setDimensions("");
    setDescription("");
    setTagsText("");
    setMediaUrl("");
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  }

  return (
    <form id="novo-trabalho" onSubmit={handleSubmit} className="space-y-4 bg-(--background)/60 p-5 sm:p-6">
      <h2 className="text-base font-bold text-(--foreground)">Trabalhos artísticos no portfólio ({profile.works.length})</h2>

      {added && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-(--primary-fg)/30 bg-(--primary-soft) p-3 text-sm font-medium text-(--primary-ink)">
          <span>Trabalho adicionado e salvo no banco!</span>
          <Link href="/perfil" className="font-bold underline">
            Ver galeria
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="work-title" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Título
          </label>
          <input id="work-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD} required />
        </div>
        <div>
          <label htmlFor="work-year" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Ano
          </label>
          <input id="work-year" type="text" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} className={`${FIELD} tabular-nums`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="work-kind" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Tipo de mídia
          </label>
          <select id="work-kind" value={kind} onChange={(e) => setKind(e.target.value as WorkKind)} className={FIELD}>
            {WORK_KINDS.map((item) => (
              <option key={item} value={item}>
                {WORK_KIND_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="work-category" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Linguagem artística
          </label>
          <select id="work-category" value={category} onChange={(e) => setCategory(e.target.value)} className={FIELD}>
            {availableCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="work-technique" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Técnica
          </label>
          <input id="work-technique" type="text" value={technique} onChange={(e) => setTechnique(e.target.value)} placeholder="Ex.: óleo sobre tela" className={FIELD} />
        </div>
        <div>
          <label htmlFor="work-dimensions" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Dimensões
          </label>
          <input id="work-dimensions" type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="Ex.: 120 × 150 cm ou duração 3:40" className={FIELD} />
        </div>
      </div>

      {playable && (
        <div>
          <label htmlFor="work-media" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Link do {kind === "VIDEO" ? "vídeo" : "áudio"}
          </label>
          <input
            id="work-media"
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://youtu.be/… ou https://…/arquivo.mp3"
            className={FIELD}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "work-media-error" : undefined}
          />
          {error && (
            <p id="work-media-error" role="alert" className="mt-1 text-xs font-semibold text-(--danger)">
              {error}
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="work-description" className="mb-1 flex items-center justify-between text-xs font-bold text-(--text-subtle)">
          <span>Texto curto que define a obra</span>
          <span className="tabular-nums font-medium">
            {description.length}/{DESCRIPTION_LIMIT}
          </span>
        </label>
        <textarea
          id="work-description"
          value={description}
          maxLength={DESCRIPTION_LIMIT}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={FIELD}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="work-tags" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Temas que abrange (separe por vírgula)
          </label>
          <input id="work-tags" type="text" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="memória, cidade, cor" className={FIELD} />
        </div>
        <div>
          <label htmlFor="work-cover" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Capa
          </label>
          <select id="work-cover" value={cover} onChange={(e) => setCover(e.target.value)} className={FIELD}>
            {PRESET_COVERS.map((item) => (
              <option key={item.url} value={item.url}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-bold text-(--on-accent) transition-colors hover:bg-(--accent-hover)"
      >
        <Plus size={16} />
        <span>Publicar trabalho no perfil</span>
      </button>

      {profile.works.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-(--text-subtle)">Ordem na galeria</p>
          <ol className="space-y-2">
            {profile.works.map((work, index) => (
              <li key={work.id} className="flex items-center justify-between gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-card) p-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-(--text-subtle)">{index + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={work.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-(--foreground)">{work.title}</p>
                    <p className="truncate text-xs text-(--text-subtle)">
                      {WORK_KIND_LABELS[work.kind ?? "IMAGEM"]} · {work.category} · {work.year}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => void moveArtWorkOfCurrentProfile(work.id, -1)}
                    disabled={index === 0}
                    aria-label={`Subir ${work.title} na galeria`}
                    className="cursor-pointer rounded-lg p-2 text-(--text-subtle) transition-colors hover:bg-(--surface-subtle) hover:text-(--primary-fg) disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void moveArtWorkOfCurrentProfile(work.id, 1)}
                    disabled={index === profile.works.length - 1}
                    aria-label={`Descer ${work.title} na galeria`}
                    className="cursor-pointer rounded-lg p-2 text-(--text-subtle) transition-colors hover:bg-(--surface-subtle) hover:text-(--primary-fg) disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeArtWorkFromCurrentProfile(work.id)}
                    aria-label={`Remover ${work.title}`}
                    className="cursor-pointer rounded-lg p-2 text-(--text-subtle) transition-colors hover:bg-(--danger-soft) hover:text-(--danger)"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </form>
  );
}
