"use client";

import { Logo, LogoMark } from "@/shared/components/atoms/Logo";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Home,
  LogOut,
  PlusCircle,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import EditalSummaryModal from "@/shared/components/organisms/EditalSummaryModal";
import AdSlot from "@/shared/components/molecules/AdSlot";
import ArtistList from "@/shared/components/molecules/ArtistList";
import ThemeToggle from "@/shared/components/molecules/ThemeToggle";

interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export default function AppShell({ title, children }: AppShellProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const {
    profiles,
    currentProfile,
    currentProposer,
    isProposer,
    savedEditalIds,
  } = useSocialStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const selfId = isProposer && currentProposer ? currentProposer.id : currentProfile.id;

  const otherUsers = useMemo(
    () => profiles.filter((p) => p.id !== selfId),
    [profiles, selfId]
  );

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return otherUsers;
    return otherUsers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.city.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
    );
  }, [otherUsers, searchQuery]);

  const navItems = [
    { href: "/", label: "Início", icon: Home, active: pathname === "/" },
    ...(isProposer
      ? [
          {
            href: "/publicar-edital",
            label: "Publicar edital",
            icon: PlusCircle,
            active: pathname.startsWith("/publicar-edital"),
          },
        ]
      : []),
    {
      href: "/salvos",
      label: "Salvos",
      icon: Bookmark,
      active: pathname.startsWith("/salvos"),
      count: savedEditalIds.length,
    },
    {
      href: "/perfil",
      label: "Perfil",
      icon: User,
      active: pathname === "/perfil",
    },
    {
      href: "/configuracoes",
      label: "Configurações",
      icon: Settings,
      active: pathname.startsWith("/configuracoes"),
    },
  ];

  const activeAvatar =
    isProposer && currentProposer
      ? currentProposer.imgUrl
      : currentProfile.avatarUrl;
  const activeName =
    isProposer && currentProposer
      ? currentProposer.name
      : currentProfile.name;
  const activeSubtitle =
    isProposer && currentProposer
      ? `${currentProposer.handle} · Propositor`
      : currentProfile.handle;

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <div className="max-w-[1200px] mx-auto flex justify-center">
        {/* Left Sidebar (Instagram / X style) */}
        <aside className="hidden md:flex flex-col justify-between w-60 xl:w-64 shrink-0 sticky top-0 h-screen px-4 py-5">
          <div className="flex min-h-0 flex-1 flex-col gap-6">
            <Link href="/" aria-label="Editaliza, página inicial" className="inline-flex items-center px-3 py-1.5">
              <Logo />
            </Link>

            <nav className="flex flex-col gap-1" aria-label="Menu lateral">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] transition-colors whitespace-nowrap ${
                      item.active
                        ? "bg-(--primary-soft) text-(--primary-fg) font-bold"
                        : "text-(--foreground) font-medium hover:bg-(--surface-subtle)"
                    }`}
                  >
                    <span className="flex items-center gap-3.5">
                      <Icon
                        size={21}
                        strokeWidth={item.active ? 2.4 : 1.9}
                        className={item.active ? "text-(--primary-fg)" : "text-(--text-muted)"}
                      />
                      <span>{item.label}</span>
                    </span>
                    {typeof item.count === "number" && item.count > 0 && (
                      <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-(--accent) text-(--on-accent)">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Publicidade entre o último item do menu (Configurações) e o perfil: ocupa a altura
                que sobra, até a linha que separa o cartão do usuário */}
            <div className="min-h-0 flex-1 pb-4">
              <AdSlot variant="sidebar" slot={1} />
            </div>
          </div>

          {/* Current user mini-card + logout */}
          <div className="border-t border-(--border-subtle) pt-4 space-y-2">
            <Link
              href="/perfil"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-(--surface-subtle) transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeAvatar}
                alt={activeName}
                className="w-10 h-10 rounded-full object-cover border border-(--border-subtle) shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-(--foreground) truncate">
                  {activeName}
                </p>
                <p className="text-xs text-(--text-subtle) truncate">
                  {activeSubtitle}
                </p>
              </div>
            </Link>

            <ThemeToggle
              showLabel
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-(--text-muted) hover:bg-(--surface-subtle) hover:text-(--foreground) transition-colors cursor-pointer"
            />

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-(--text-muted) hover:bg-(--danger-soft) hover:text-(--danger) transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span>Sair da conta</span>
            </button>
          </div>
        </aside>

        {/* Center Feed / Main Stream */}
        <div className="flex-1 max-w-[640px] min-w-0 bg-(--bg-card) md:border-x border-(--border-subtle) min-h-screen pb-20 md:pb-10">
          {/* Sticky Top Header */}
          <header className="sticky top-0 z-30 bg-(--bg-card)/95 backdrop-blur border-b border-(--border-subtle) px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Link href="/" className="md:hidden shrink-0" aria-label="Editaliza, página inicial">
                  <LogoMark size={32} />
                </Link>
                <h1 className="text-lg font-bold text-(--foreground) truncate">
                  {title}
                </h1>
              </div>

              {/* Mobile / Tablet search trigger */}
              <div className="flex items-center gap-2 lg:hidden">
                <ThemeToggle className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-full bg-(--surface-subtle) text-(--text-muted) hover:text-(--foreground) cursor-pointer" />
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen((v) => !v)}
                  aria-label="Buscar artistas"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-(--surface-subtle) text-sm font-medium text-(--text-muted) hover:text-(--primary-fg) cursor-pointer"
                >
                  <Search size={16} />
                  <span>Buscar</span>
                </button>
              </div>
            </div>

            {/* Expandable search drawer on mobile/tablet */}
            {mobileSearchOpen && (
              <div className="mt-3 pt-3 border-t border-(--border-subtle) lg:hidden">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-subtle)"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar usuário, @handle ou arte (ex: Pintura)..."
                    className="w-full pl-9 pr-9 py-2 rounded-full bg-(--background) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg)"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-subtle)"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="mt-2.5 divide-y divide-(--border-subtle) border border-(--border-subtle) rounded-xl bg-(--bg-card)">
                  {filteredUsers.length === 0 ? (
                    <p className="p-3 text-sm text-(--text-subtle)">
                      Nenhum artista encontrado.
                    </p>
                  ) : (
                    filteredUsers.map((artist) => (
                      <Link
                        key={artist.id}
                        href={`/perfil/${artist.id}`}
                        onClick={() => setMobileSearchOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-(--background) transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={artist.avatarUrl}
                          alt={artist.name}
                          className="w-10 h-10 rounded-full object-cover border border-(--border-subtle)"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-(--foreground) truncate">
                            {artist.name}
                          </p>
                          <p className="text-xs text-(--text-subtle) truncate">
                            {artist.handle} · {artist.tags.join(", ")}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </header>

          {children}
        </div>

        {/* Coluna da direita (desktop lg+): busca e perfis no topo; a publicidade vem depois e fica fixa ao rolar */}
        <aside className="hidden w-80 shrink-0 px-5 py-4 lg:flex lg:flex-col">
          <div className="flex flex-1 flex-col gap-5">
            {/* Search bar for other users */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-subtle)"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar outros usuários..."
                aria-label="Buscar outros usuários"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-(--bg-card) border border-(--border-subtle) text-sm text-(--foreground) placeholder-(--text-subtle) focus:outline-none focus:ring-2 focus:ring-(--primary-fg) focus:border-(--primary-fg)"
              />
            </div>

            <section aria-label="Artistas na rede" className="overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-card)">
              <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-3">
                <h2 className="text-sm font-bold text-(--foreground)">
                  {searchQuery.trim() ? "Resultados da busca" : "Artistas na rede"}
                </h2>
                <span className="text-xs font-medium tabular-nums text-(--text-subtle)">{filteredUsers.length}</span>
              </div>
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-sm text-(--text-subtle)">Nenhum perfil encontrado para &ldquo;{searchQuery}&rdquo;.</div>
              ) : (
                <ArtistList key={searchQuery.trim()} artists={filteredUsers} />
              )}
            </section>

            {/* Estilo LinkedIn: ao rolar, os banners ficam fixos à direita. A altura é limitada à da janela. */}
            <div className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col gap-5 overflow-y-auto">
              <AdSlot variant="rail" slot={0} />
              <AdSlot variant="rail" slot={2} />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Navegação inferior"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-(--bg-card)/95 backdrop-blur border-t border-(--border-subtle) h-15 flex items-center justify-around px-2"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] font-medium ${
                item.active ? "text-(--primary-fg) font-bold" : "text-(--text-muted)"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {typeof item.count === "number" && item.count > 0 && (
                <span className="absolute top-0.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-(--accent) text-(--on-accent) text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Plain-language Edital Summary Modal */}
      <EditalSummaryModal />
    </div>
  );
}
