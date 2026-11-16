import type { ReactNode } from "react";

import { BrandMark } from "@/shared/components/atoms/BrandMark";

type AuthCardProps = { subtitle: string; children: ReactNode; footer?: ReactNode };

export function AuthCard({ subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary to-accent" />
        <div className="flex flex-col items-center gap-6 p-8">
          <div className="flex flex-col items-center text-center">
            <BrandMark size="lg" className="mb-3" />
            <h1 className="text-2xl font-bold tracking-tight text-primary">Editaliza</h1>
            <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink-muted">{subtitle}</p>
          </div>
          <div className="w-full">{children}</div>
          {footer && <p className="text-sm text-ink-muted">{footer}</p>}
        </div>
      </div>
    </main>
  );
}
