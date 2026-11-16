"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Avatar } from "@/shared/components/atoms/Avatar";

export type RailArtist = { id: number; name: string; handle: string; city: string; tags: string[]; avatarUrl?: string };

type ArtistRailProps = { artists: RailArtist[]; hrefFor: (id: number) => string };

export function filterArtists(artists: RailArtist[], query: string): RailArtist[] {
  const term = query.trim().toLocaleLowerCase("pt-BR");
  if (!term) return artists;
  return artists.filter((artist) =>
    [artist.name, artist.handle, artist.city, ...artist.tags].some((text) => text.toLocaleLowerCase("pt-BR").includes(term)),
  );
}

export function ArtistRail({ artists, hrefFor }: ArtistRailProps) {
  const [query, setQuery] = useState("");
  const found = useMemo(() => filterArtists(artists, query), [artists, query]);
  const searching = query.trim().length > 0;

  return (
    <>
      <div className="relative">
        <Search size={17} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar outros usuários..."
          aria-label="Buscar outros usuários"
          className="w-full rounded-pill border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <section aria-label="Artistas" className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-bold text-ink">{searching ? "Resultados da busca" : "Artistas na rede"}</h2>
          <span className="text-xs font-medium tabular-nums text-ink-subtle">{found.length}</span>
        </div>
        {found.length === 0 ? (
          <p className="p-4 text-sm text-ink-subtle">Nenhum perfil encontrado para “{query}”.</p>
        ) : (
          <ul className="divide-y divide-line">
            {found.map((artist) => (
              <li key={artist.id}>
                <Link href={hrefFor(artist.id)} className="flex items-start gap-3 p-3.5 transition-colors hover:bg-bg">
                  <Avatar name={artist.name} src={artist.avatarUrl} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{artist.name}</p>
                    <p className="truncate text-xs text-ink-subtle">
                      {artist.handle} · {artist.city}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-primary-ink">{artist.tags.join(" · ")}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
