import { Search } from "lucide-react";
import AdSlot from "@/shared/components/molecules/AdSlot";
import ArtistList from "@/shared/components/molecules/ArtistList";
import type { ComponentProps } from "react";

interface ShellRightRailProps {
  query: string;
  onQueryChange: (query: string) => void;
  users: ComponentProps<typeof ArtistList>["artists"];
}

/** Coluna da direita (desktop lg+): busca e perfis no topo; a publicidade vem depois e fica fixa ao rolar. */
export default function ShellRightRail({ query, onQueryChange, users }: ShellRightRailProps) {
  return (
    <aside className="hidden w-80 shrink-0 px-5 py-4 lg:flex lg:flex-col">
      <div className="flex flex-1 flex-col gap-5">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-subtle)"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar outros usuários..."
            aria-label="Buscar outros usuários"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-(--bg-card) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg) focus:border-(--primary-fg)"
          />
        </div>

        <section aria-label="Artistas na rede" className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-card)">
          <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-3">
            <h2 className="text-sm font-bold text-(--foreground)">
              {query.trim() ? "Resultados da busca" : "Artistas na rede"}
            </h2>
            <span className="text-xs font-medium tabular-nums text-(--text-subtle)">{users.length}</span>
          </div>
          {users.length === 0 ? (
            <div className="p-4 text-sm text-(--text-subtle)">Nenhum perfil encontrado para &ldquo;{query}&rdquo;.</div>
          ) : (
            <ArtistList key={query.trim()} artists={users} />
          )}
        </section>

        {/* Estilo LinkedIn: ao rolar, os banners ficam fixos à direita. A altura é limitada à da janela. */}
        <div className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col gap-5 overflow-y-auto">
          <AdSlot variant="rail" slot={0} />
          <AdSlot variant="rail" slot={2} />
        </div>
      </div>
    </aside>
  );
}
