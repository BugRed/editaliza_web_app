"use client";

import { Briefcase, Building2, Home, LayoutList, Bookmark, Shield, User } from "lucide-react";
import type { ReactNode } from "react";

import { AppShell, type NavEntry } from "@/shared/components/organisms/AppShell";

const ITEMS: NavEntry[] = [
  { href: "/prototipo", label: "Mapa", icon: LayoutList },
  { href: "/prototipo/feed", label: "Editais", icon: Home },
  { href: "/prototipo/salvos", label: "Salvos", icon: Bookmark },
  { href: "/prototipo/perfil", label: "Perfil", icon: User },
  { href: "/prototipo/admin/editais", label: "Admin", icon: Shield },
  { href: "/prototipo/organizacao/editais/novo", label: "Organização", icon: Building2 },
  { href: "/prototipo/onboarding", label: "Onboarding", icon: Briefcase },
];

export function PrototypeShell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      items={ITEMS}
      banner={
        <p role="note" className="bg-accent-soft px-4 py-2 text-center text-sm font-medium text-ink">
          Protótipo: dados fixos, nada é salvo nem enviado.
        </p>
      }
    >
      {children}
    </AppShell>
  );
}
