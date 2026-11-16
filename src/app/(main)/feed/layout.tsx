"use client";

import { Home } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "@/app/hooks/useAuth";
import { AppShell, type NavEntry } from "@/shared/components/organisms/AppShell";

// Só entram na navegação as rotas que existem de verdade; o restante vive em /prototipo.
const NAV_ITEMS: NavEntry[] = [{ href: "/feed", label: "Editais", icon: Home }];

export default function FeedLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  return (
    <AppShell items={NAV_ITEMS} onLogout={logout}>
      {children}
    </AppShell>
  );
}
