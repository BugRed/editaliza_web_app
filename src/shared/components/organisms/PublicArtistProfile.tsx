import { Avatar } from "@/shared/components/atoms/Avatar";
import { Badge } from "@/shared/components/atoms/Badge";
import { WorksView } from "@/shared/components/organisms/RecordLists";
import type { PublicArtist } from "@/shared/lib/profile-view";

export function PublicArtistProfile({ artist }: { artist: PublicArtist }) {
  return (
    <>
      <header className="flex items-center gap-4">
        <Avatar name={artist.name} src={artist.avatarUrl} className="size-16 text-xl" />
        <div>
          <h1 className="text-2xl font-semibold text-ink">{artist.name}</h1>
          <p className="text-ink-muted">{artist.city}</p>
        </div>
      </header>
      <p className="max-w-prose text-ink">{artist.bio}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Linguagens">
        {artist.languages.map((language) => (
          <li key={language}>
            <Badge tone="primary">{language}</Badge>
          </li>
        ))}
      </ul>
      <WorksView works={artist.works} />
    </>
  );
}
