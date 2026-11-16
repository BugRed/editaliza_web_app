"use client";

import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { NavItem } from "@/shared/components/molecules/NavItem";

export type NavEntry = { href: string; label: string; icon: LucideIcon };

type AppShellProps = { items: NavEntry[]; onLogout?: () => void; banner?: ReactNode; children: ReactNode };

export function isNavEntryActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Entre entradas aninhadas (/perfil e /perfil/obras) vale a mais específica.
export function findActiveHref(pathname: string, items: NavEntry[]): string | undefined {
  return items
    .filter((item) => isNavEntryActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function AppShell({ items, onLogout, banner, children }: AppShellProps) {
  const activeHref = findActiveHref(usePathname(), items);

  return (
    <div className="min-h-screen bg-bg md:grid md:grid-cols-[16rem_1fr]">
      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface p-2 md:static md:border-r md:border-t-0 md:p-4">
        <p className="mb-4 hidden px-3 text-lg font-semibold text-primary md:block">Editaliza</p>
        <ul className="flex justify-around gap-1 md:flex-col md:justify-start">
          {items.map((item) => (
            <li key={item.href}>
              <NavItem {...item} active={item.href === activeHref} />
            </li>
          ))}
        </ul>
        {onLogout && (
          <Button variant="ghost" size="sm" onClick={onLogout} className="mt-4 hidden md:inline-flex">
            Sair
          </Button>
        )}
      </nav>
      <div className="pb-20 md:pb-0">
        {banner}
        <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
