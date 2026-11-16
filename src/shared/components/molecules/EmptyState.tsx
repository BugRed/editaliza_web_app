import type { ReactNode } from "react";

type EmptyStateProps = { title: string; description?: string; action?: ReactNode };

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-8 text-center">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description && <p className="max-w-prose text-ink-muted">{description}</p>}
      {action}
    </div>
  );
}
