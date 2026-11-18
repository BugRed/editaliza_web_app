import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  tone?: "default" | "danger";
}

export default function SettingsSection({ title, description, children, tone = "default" }: SettingsSectionProps) {
  const border = tone === "danger" ? "border-(--danger-border)" : "border-(--border-subtle)";
  return (
    <section className={`rounded-xl border ${border} bg-(--bg-card) p-4 sm:p-5 space-y-3`}>
      <div>
        <h2 className={`text-base font-bold ${tone === "danger" ? "text-(--danger)" : "text-(--foreground)"}`}>{title}</h2>
        <p className="text-sm text-(--text-muted)">{description}</p>
      </div>
      {children}
    </section>
  );
}
