import Link from "next/link";
import { Search, X } from "lucide-react";

interface DrawerUser {
  id: number;
  name: string;
  handle: string;
  avatarUrl: string;
  tags: string[];
}

interface MobileSearchDrawerProps {
  query: string;
  onQueryChange: (query: string) => void;
  users: DrawerUser[];
  onPick: () => void;
}

export default function MobileSearchDrawer({ query, onQueryChange, users, onPick }: MobileSearchDrawerProps) {
  return (
    <div className="mt-3 pt-3 border-t border-(--border-subtle) lg:hidden">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-subtle)" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar usuário, @handle ou arte (ex: Pintura)..."
          aria-label="Buscar usuário, @handle ou arte"
          className="w-full pl-9 pr-9 py-2 rounded-full bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
        />
        {query && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-subtle)"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="mt-2.5 divide-y divide-(--border-subtle) border border-(--border-subtle) rounded-xl bg-(--bg-card)">
        {users.length === 0 ? (
          <p className="p-3 text-sm text-(--text-subtle)">Nenhum artista encontrado.</p>
        ) : (
          users.map((artist) => (
            <Link
              key={artist.id}
              href={`/perfil/${artist.id}`}
              onClick={onPick}
              className="flex items-center gap-3 p-3 hover:bg-(--background) transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artist.avatarUrl}
                alt={artist.name}
                className="w-10 h-10 rounded-full object-cover border border-(--border-subtle)"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-(--foreground) truncate">{artist.name}</p>
                <p className="text-xs text-(--text-subtle) truncate">
                  {artist.handle} · {artist.tags.join(", ")}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
