"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { buildThemeCookie, nextThemePreference, parseThemePreference, type ThemePreference } from "@/shared/lib/theme";

const LABELS: Record<ThemePreference, string> = {
  system: "Tema: segue o sistema",
  light: "Tema: claro",
  dark: "Tema: escuro",
};

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/** O servidor pôs o atributo em <html> a partir do cookie; o botão só lê esse atributo depois de montar. */
export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    // Lê o atributo que o servidor pôs em <html>; só dá para fazer depois de montar, para não divergir do HTML do servidor.
    setPreference(parseThemePreference(document.documentElement.dataset.theme));
  }, []);

  function cycle(): void {
    const next = nextThemePreference(preference);
    document.cookie = buildThemeCookie(next);
    if (next === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    setPreference(next);
  }

  const Icon = ICONS[preference];
  return (
    <button type="button" onClick={cycle} aria-label={`${LABELS[preference]}. Alternar tema`} title={LABELS[preference]} className={className}>
      <Icon size={18} aria-hidden="true" />
      {showLabel && <span>{LABELS[preference]}</span>}
    </button>
  );
}
