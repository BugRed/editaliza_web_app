"use client";

import { LogOut, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Avatar } from "@/shared/components/atoms/Avatar";
import { BrandMark } from "@/shared/components/atoms/BrandMark";
import { NavItem } from "@/shared/components/molecules/NavItem";

export type NavEntry = { href: string; label: string; icon: LucideIcon; count?: number };
export type ShellUser = { name: string; subtitle: string; avatarUrl?: string };

type AppShellProps = {
  items: NavEntry[];
  user?: ShellUser;
  onLogout?: () => void;
  banner?: ReactNode;
  /** Coluna da direita (só em telas largas). */
  rail?: ReactNode;
  /** Título fixo no topo. Quando informado vira o h1 da página. */
  title?: string;
  /** Padding e espaçamento do conteúdo; o feed usa `false` para cards de ponta a ponta. */
  padded?: boolean;
  children: ReactNode;
};

export function isNavEntryActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Entre entradas aninhadas (/perfil e /perfil/obras) vale a mais específica.
export function findActiveHref(pathname: string, items: NavEntry[]): string | undefined {
  return items
    .filter((item) => isNavEntryActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function AppShell({ items, user, onLogout, banner, rail, title, padded = true, children }: AppShellProps) {
  const activeHref = findActiveHref(usePathname(), items);
  const headerLabel = title ?? items.find((item) => item.href === activeHref)?.label ?? "Editaliza";

  return (
    <div className="min-h-screen bg-bg text-ink">
      {banner}
      <div className="mx-auto flex max-w-[1200px] justify-center">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between px-4 py-5 md:flex xl:w-64">
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-flex items-center gap-2.5 px-3 py-1.5 text-xl font-bold tracking-tight text-primary">
              <BrandMark />
              Editaliza
            </Link>
            <nav aria-label="Principal" className="flex flex-col gap-1">
              {items.map((item) => (
                <NavItem key={item.href} {...item} active={item.href === activeHref} />
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            {user && (
              <div className="flex items-center gap-3 p-2">
                <Avatar name={user.name} src={user.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-ink-subtle">{user.subtitle}</p>
                </div>
              </div>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <LogOut size={18} aria-hidden="true" />
                Sair da conta
              </button>
            )}
          </div>
        </aside>

        <div className="min-h-screen max-w-[640px] min-w-0 flex-1 border-line bg-surface pb-20 md:border-x md:pb-10">
          <header className="sticky top-0 z-30 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <Link href="/" aria-label="Editaliza" className="md:hidden">
                <BrandMark size="sm" />
              </Link>
              {title ? (
                <h1 className="truncate text-lg font-bold text-ink">{title}</h1>
              ) : (
                <p className="truncate text-lg font-bold text-ink">{headerLabel}</p>
              )}
            </div>
          </header>
          <main className={padded ? "flex flex-col gap-6 p-4 md:p-6" : undefined}>{children}</main>
        </div>

        {rail && (
          <aside className="hidden w-80 shrink-0 px-5 py-4 lg:block">
            <div className="sticky top-4 flex flex-col gap-5">{rail}</div>
          </aside>
        )}
      </div>

      <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-40 flex h-[3.75rem] items-center justify-around border-t border-line bg-surface/95 backdrop-blur md:hidden">
        {items.map((item) => (
          <NavItem key={item.href} {...item} variant="bottom" active={item.href === activeHref} />
        ))}
      </nav>
    </div>
  );
}
