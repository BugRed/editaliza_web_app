"use client";

import { LogoMark } from "@/shared/components/atoms/Logo";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, PlusCircle, Search, Settings, User } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import { filterUsers } from "@/shared/lib/user-search";
import EditalSummaryModal from "@/shared/components/organisms/EditalSummaryModal";
import ShellRightRail from "@/shared/components/organisms/ShellRightRail";
import ShellSidebar from "@/shared/components/organisms/ShellSidebar";
import MobileSearchDrawer from "@/shared/components/molecules/MobileSearchDrawer";
import { BottomNav, type ShellNavItem } from "@/shared/components/molecules/ShellNav";
import ThemeToggle from "@/shared/components/molecules/ThemeToggle";

interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

function buildNavItems(pathname: string, isProposer: boolean, savedCount: number): ShellNavItem[] {
  return [
    { href: "/", label: "Início", icon: Home, active: pathname === "/" },
    ...(isProposer
      ? [{ href: "/publicar-edital", label: "Publicar edital", icon: PlusCircle, active: pathname.startsWith("/publicar-edital") }]
      : []),
    { href: "/salvos", label: "Salvos", icon: Bookmark, active: pathname.startsWith("/salvos"), count: savedCount },
    { href: "/perfil", label: "Perfil", icon: User, active: pathname === "/perfil" },
    { href: "/configuracoes", label: "Configurações", icon: Settings, active: pathname.startsWith("/configuracoes") },
  ];
}

export default function AppShell({ title, children }: AppShellProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { profiles, currentProfile, currentProposer, isProposer, savedEditalIds } = useSocialStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const proposer = isProposer && currentProposer ? currentProposer : null;
  const selfId = proposer ? proposer.id : currentProfile.id;

  const filteredUsers = useMemo(
    () =>
      filterUsers(
        profiles.filter((p) => p.id !== selfId),
        searchQuery
      ),
    [profiles, selfId, searchQuery]
  );

  const navItems = buildNavItems(pathname, isProposer, savedEditalIds.length);

  const user = {
    avatar: proposer ? proposer.imgUrl : currentProfile.avatarUrl,
    name: proposer ? proposer.name : currentProfile.name,
    subtitle: proposer ? `${proposer.handle} · Propositor` : currentProfile.handle,
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <div className="max-w-[1200px] mx-auto flex justify-center">
        <ShellSidebar
          items={navItems}
          user={user}
          onLogout={logout}
        />

        <div className="flex-1 max-w-[640px] min-w-0 bg-(--bg-card) md:border-x border-(--border-subtle) min-h-screen pb-20 md:pb-10">
          <header className="sticky top-0 z-30 bg-(--bg-card)/95 backdrop-blur border-b border-(--border-subtle) px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Link href="/" className="md:hidden shrink-0" aria-label="Editaliza, página inicial">
                  <LogoMark size={32} />
                </Link>
                <h1 className="text-lg font-bold text-(--foreground) truncate">{title}</h1>
              </div>

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

            {mobileSearchOpen && (
              <MobileSearchDrawer
                query={searchQuery}
                onQueryChange={setSearchQuery}
                users={filteredUsers}
                onPick={() => setMobileSearchOpen(false)}
              />
            )}
          </header>

          {children}
        </div>

        <ShellRightRail query={searchQuery} onQueryChange={setSearchQuery} users={filteredUsers} />
      </div>

      <BottomNav items={navItems} />
      <EditalSummaryModal />
    </div>
  );
}
