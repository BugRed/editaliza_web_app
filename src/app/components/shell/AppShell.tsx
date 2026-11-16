"use client";

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
  Sun,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import EditalSummaryModal from "@/app/components/modal/EditalSummaryModal";

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
    <div className="min-h-screen bg-[#F8FAFB] text-[#102A30]">
      <div className="max-w-[1200px] mx-auto flex justify-center">
        {/* Left Sidebar (Instagram / X style) */}
        <aside className="hidden md:flex flex-col justify-between w-60 xl:w-64 shrink-0 sticky top-0 h-screen px-4 py-5">
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 px-3 py-1.5 text-xl font-bold text-[#0E7C86] tracking-tight"
            >
              <span className="w-9 h-9 rounded-xl bg-[#FFB800] text-[#102A30] flex items-center justify-center shrink-0">
                <Sun size={20} strokeWidth={2.3} aria-hidden="true" />
              </span>
              <span>Editaliza</span>
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
                        ? "bg-[#E6F4F5] text-[#0E7C86] font-bold"
                        : "text-[#102A30] font-medium hover:bg-[#F0F6F7]"
                    }`}
                  >
                    <span className="flex items-center gap-3.5">
                      <Icon
                        size={21}
                        strokeWidth={item.active ? 2.4 : 1.9}
                        className={item.active ? "text-[#0E7C86]" : "text-[#4A656B]"}
                      />
                      <span>{item.label}</span>
                    </span>
                    {typeof item.count === "number" && item.count > 0 && (
                      <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-[#FFB800] text-[#102A30]">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Current user mini-card + logout */}
          <div className="border-t border-[#DCE6E8] pt-4 space-y-2">
            <Link
              href="/perfil"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F0F6F7] transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeAvatar}
                alt={activeName}
                className="w-10 h-10 rounded-full object-cover border border-[#DCE6E8] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#102A30] truncate">
                  {activeName}
                </p>
                <p className="text-xs text-[#6B8388] truncate">
                  {activeSubtitle}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-[#4A656B] hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span>Sair da conta</span>
            </button>
          </div>
        </aside>

        {/* Center Feed / Main Stream */}
        <div className="flex-1 max-w-[640px] min-w-0 bg-white md:border-x border-[#DCE6E8] min-h-screen pb-20 md:pb-10">
          {/* Sticky Top Header */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#DCE6E8] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Link
                  href="/"
                  className="md:hidden w-8 h-8 rounded-lg bg-[#FFB800] text-[#102A30] flex items-center justify-center shrink-0"
                  aria-label="Editaliza"
                >
                  <Sun size={18} strokeWidth={2.3} />
                </Link>
                <h1 className="text-lg font-bold text-[#102A30] truncate">
                  {title}
                </h1>
              </div>

              {/* Mobile / Tablet search trigger */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen((v) => !v)}
                  aria-label="Buscar artistas"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F6F7] text-sm font-medium text-[#4A656B] hover:text-[#0E7C86] cursor-pointer"
                >
                  <Search size={16} />
                  <span>Buscar</span>
                </button>
              </div>
            </div>

            {/* Expandable search drawer on mobile/tablet */}
            {mobileSearchOpen && (
              <div className="mt-3 pt-3 border-t border-[#DCE6E8] lg:hidden">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8388]"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar usuário, @handle ou arte (ex: Pintura)..."
                    className="w-full pl-9 pr-9 py-2 rounded-full bg-[#F8FAFB] border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8388]"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="mt-2.5 divide-y divide-[#DCE6E8] border border-[#DCE6E8] rounded-xl bg-white">
                  {filteredUsers.length === 0 ? (
                    <p className="p-3 text-sm text-[#6B8388]">
                      Nenhum artista encontrado.
                    </p>
                  ) : (
                    filteredUsers.map((artist) => (
                      <Link
                        key={artist.id}
                        href={`/perfil/${artist.id}`}
                        onClick={() => setMobileSearchOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-[#F8FAFB] transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={artist.avatarUrl}
                          alt={artist.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#DCE6E8]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#102A30] truncate">
                            {artist.name}
                          </p>
                          <p className="text-xs text-[#6B8388] truncate">
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

        {/* Right Sticky Search & Users Rail (Desktop lg+) */}
        <aside className="hidden lg:block w-80 shrink-0 px-5 py-4">
          <div className="sticky top-4 space-y-5">
            {/* Search bar for other users */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B8388]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar outros usuários..."
                aria-label="Buscar outros usuários"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#DCE6E8] text-sm text-[#102A30] placeholder-[#6B8388] focus:outline-none focus:ring-2 focus:ring-[#0E7C86] focus:border-[#0E7C86]"
              />
            </div>

            {/* Search results / seeded users list */}
            <section className="bg-white border border-[#DCE6E8] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#DCE6E8] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#102A30]">
                  {searchQuery.trim() ? "Resultados da busca" : "Artistas na rede"}
                </h2>
                <span className="text-xs font-medium text-[#6B8388] tabular-nums">
                  {filteredUsers.length}
                </span>
              </div>

              <div className="divide-y divide-[#DCE6E8]">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-sm text-[#6B8388]">
                    Nenhum perfil encontrado para &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  filteredUsers.map((artist) => (
                    <Link
                      key={artist.id}
                      href={`/perfil/${artist.id}`}
                      className="flex items-start gap-3 p-3.5 hover:bg-[#F8FAFB] transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#DCE6E8] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#102A30] truncate">
                          {artist.name}
                        </p>
                        <p className="text-xs text-[#6B8388] truncate">
                          {artist.handle}
                          {artist.city
                            ? ` · ${artist.city}${artist.state ? `, ${artist.state}` : ""}`
                            : ""}
                        </p>
                        <p className="text-xs font-medium text-[#09585F] mt-1 truncate">
                          {artist.tags.join(" · ")}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Navegação inferior"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-[#DCE6E8] h-15 flex items-center justify-around px-2"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] font-medium ${
                item.active ? "text-[#0E7C86] font-bold" : "text-[#4A656B]"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {typeof item.count === "number" && item.count > 0 && (
                <span className="absolute top-0.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#FFB800] text-[#102A30] text-[10px] font-bold flex items-center justify-center tabular-nums">
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
