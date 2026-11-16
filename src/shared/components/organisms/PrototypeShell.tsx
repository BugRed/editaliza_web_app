"use client";

import { Bookmark, Building2, Home, LayoutList, Settings, Shield, User } from "lucide-react";
import type { ReactNode } from "react";

import { AppShell, type NavEntry } from "@/shared/components/organisms/AppShell";
import { ArtistRail } from "@/shared/components/organisms/ArtistRail";
import { RAIL_ARTISTS } from "@/shared/fixtures/prototype";

const ITEMS: NavEntry[] = [
  { href: "/prototipo", label: "Mapa", icon: LayoutList },
  { href: "/prototipo/feed", label: "Início", icon: Home },
  { href: "/prototipo/salvos", label: "Salvos", icon: Bookmark, count: 1 },
  { href: "/prototipo/perfil", label: "Perfil", icon: User },
  { href: "/prototipo/onboarding", label: "Configurações", icon: Settings },
  { href: "/prototipo/admin/editais", label: "Admin", icon: Shield },
  { href: "/prototipo/organizacao/editais/novo", label: "Publicar edital", icon: Building2 },
];

export function PrototypeShell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      items={ITEMS}
      user={{ name: "Maria Exemplo", subtitle: "@maria", avatarUrl: "/images/avatar_maria.jpg" }}
      rail={<ArtistRail artists={RAIL_ARTISTS} hrefFor={(id) => `/prototipo/artistas/${id}`} />}
      banner={
        <p role="note" className="bg-accent-soft px-4 py-2 text-center text-sm font-medium text-accent-ink">
          Protótipo: dados fixos, nada é salvo nem enviado.
        </p>
      }
    >
      {children}
    </AppShell>
  );
}
