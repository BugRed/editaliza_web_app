"use client";

import { useState } from "react";
import Link from "next/link";
import type { ArtistProfile } from "@/app/lib/user-profiles";

export const ARTISTS_PAGE_SIZE = 4;

function ArtistRow({ artist }: { artist: ArtistProfile }) {
  return (
    <Link href={`/perfil/${artist.id}`} className="flex items-start gap-3 p-3.5 transition-colors hover:bg-(--background)">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={artist.avatarUrl} alt={artist.name} className="h-11 w-11 shrink-0 rounded-full border border-(--border-subtle) object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-(--foreground)">{artist.name}</p>
        <p className="truncate text-xs text-(--text-subtle)">
          {artist.handle}
          {artist.city ? ` · ${artist.city}${artist.state ? `, ${artist.state}` : ""}` : ""}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-(--primary-ink)">{artist.tags.join(" · ")}</p>
      </div>
    </Link>
  );
}

interface ArtistListProps {
  artists: ArtistProfile[];
  pageSize?: number;
}

// Recursiva: cada nível mostra `pageSize` perfis e, se sobrar gente, um "Ver mais". Ao clicar, o nível
// seguinte (esta mesma função, com o resto da lista) aparece abaixo e traz o seu próprio "Ver mais".
export default function ArtistList({ artists, pageSize = ARTISTS_PAGE_SIZE }: ArtistListProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = artists.slice(0, pageSize);
  const rest = artists.slice(pageSize);

  return (
    <>
      <ul className="divide-y divide-(--border-subtle)">
        {visible.map((artist) => (
          <li key={artist.id}>
            <ArtistRow artist={artist} />
          </li>
        ))}
      </ul>
      {rest.length > 0 &&
        (expanded ? (
          <div className="border-t border-(--border-subtle)">
            <ArtistList artists={rest} pageSize={pageSize} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full cursor-pointer border-t border-(--border-subtle) px-4 py-2.5 text-left text-xs font-bold text-(--primary-fg) transition-colors hover:bg-(--background)"
          >
            Ver mais ({rest.length})
          </button>
        ))}
    </>
  );
}
