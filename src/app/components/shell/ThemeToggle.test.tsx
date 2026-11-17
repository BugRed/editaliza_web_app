import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ThemeToggle from "@/app/components/shell/ThemeToggle";

function clearTheme(): void {
  delete document.documentElement.dataset.theme;
  document.cookie = "theme=; Path=/; Max-Age=0";
}

describe("ThemeToggle", () => {
  beforeEach(clearTheme);
  afterEach(clearTheme);

  it("começa seguindo o sistema, sem atributo nem cookie", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /segue o sistema/i })).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it("cada clique percorre claro, escuro e volta ao sistema, gravando e apagando o cookie", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button"));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.cookie).toContain("theme=light");

    await user.click(screen.getByRole("button"));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.cookie).toContain("theme=dark");

    await user.click(screen.getByRole("button"));
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(document.cookie).not.toContain("theme=");
  });

  it("lê o tema que o servidor pôs em <html> ao montar", async () => {
    document.documentElement.dataset.theme = "dark";
    render(<ThemeToggle />);
    expect(await screen.findByRole("button", { name: /escuro/i })).toBeInTheDocument();
  });
});
