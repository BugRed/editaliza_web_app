export type ThemePreference = "system" | "light" | "dark";

export const THEME_COOKIE = "theme";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Valor de cookie desconhecido ou ausente vale "system": o CSS acompanha o sistema sem JavaScript. */
export function parseThemePreference(value: string | undefined | null): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

/** Atributo de <html>; "system" não escreve nada, para o `prefers-color-scheme` mandar. */
export function themeAttribute(preference: ThemePreference): "light" | "dark" | undefined {
  return preference === "system" ? undefined : preference;
}

export function nextThemePreference(preference: ThemePreference): ThemePreference {
  if (preference === "system") return "light";
  if (preference === "light") return "dark";
  return "system";
}

/**
 * String para `document.cookie`. Não é httpOnly de propósito: o botão grava no cliente, e o tema não é segredo.
 * "system" expira o cookie em vez de gravar "system", para quem nunca escolheu e quem desfez ficarem iguais.
 */
export function buildThemeCookie(preference: ThemePreference): string {
  const base = `${THEME_COOKIE}=${preference}; Path=/; SameSite=Lax`;
  if (preference === "system") return `${THEME_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
  return `${base}; Max-Age=${ONE_YEAR_SECONDS}`;
}
