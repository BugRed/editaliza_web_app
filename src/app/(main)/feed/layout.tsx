"use client";

import { Home } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "@/app/hooks/useAuth";
import { AppShell, type NavEntry } from "@/shared/components/organisms/AppShell";

// Só entram na navegação as rotas que existem de verdade; as demais telas entram nas ondas do mapa (docs/ui/mapa-de-telas.md).
const NAV_ITEMS: NavEntry[] = [{ href: "/feed", label: "Início", icon: Home }];

export default function FeedLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <AppShell
      items={NAV_ITEMS}
      title="Editais"
      padded={false}
      user={user ? { name: user.name ?? user.email, subtitle: user.email } : undefined}
      onLogout={logout}
    >
      {children}
    </AppShell>
  );
}
