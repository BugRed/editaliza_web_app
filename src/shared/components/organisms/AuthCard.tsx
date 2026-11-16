import type { ReactNode } from "react";

type AuthCardProps = { title: string; children: ReactNode; footer?: ReactNode };

export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-surface p-8 shadow-card">
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg font-semibold text-primary">Editaliza</p>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        </div>
        {children}
        {footer && <p className="text-center text-sm text-ink-muted">{footer}</p>}
      </div>
    </main>
  );
}
