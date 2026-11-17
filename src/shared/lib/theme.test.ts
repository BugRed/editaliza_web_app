import { buildThemeCookie, nextThemePreference, parseThemePreference, themeAttribute } from "@/shared/lib/theme";

describe("tema", () => {
  it("cookie ausente, vazio ou adulterado cai em sistema", () => {
    expect(parseThemePreference(undefined)).toBe("system");
    expect(parseThemePreference("")).toBe("system");
    expect(parseThemePreference("<script>")).toBe("system");
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("light")).toBe("light");
  });

  it("sistema não escreve atributo; claro e escuro escrevem", () => {
    expect(themeAttribute("system")).toBeUndefined();
    expect(themeAttribute("light")).toBe("light");
    expect(themeAttribute("dark")).toBe("dark");
  });

  it("o botão percorre sistema, claro, escuro e volta", () => {
    expect(nextThemePreference("system")).toBe("light");
    expect(nextThemePreference("light")).toBe("dark");
    expect(nextThemePreference("dark")).toBe("system");
  });

  it("escolher sistema expira o cookie; claro e escuro duram um ano", () => {
    expect(buildThemeCookie("system")).toContain("Max-Age=0");
    expect(buildThemeCookie("dark")).toMatch(/^theme=dark;.*Max-Age=31536000/);
  });
});
