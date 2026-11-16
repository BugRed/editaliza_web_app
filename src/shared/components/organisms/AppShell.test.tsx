import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Home, User } from "lucide-react";

import { AppShell, findActiveHref, type NavEntry } from "@/shared/components/organisms/AppShell";

let mockPath = "/perfil/obras";
vi.mock("next/navigation", () => ({ usePathname: () => mockPath }));

const items: NavEntry[] = [
  { href: "/feed", label: "Editais", icon: Home },
  { href: "/perfil", label: "Perfil", icon: User },
  { href: "/perfil/obras", label: "Obras", icon: User },
];

describe("findActiveHref", () => {
  it("escolhe a entrada mais específica", () => {
    expect(findActiveHref("/perfil/obras", items)).toBe("/perfil/obras");
    expect(findActiveHref("/perfil/trajetoria", items)).toBe("/perfil");
  });

  it("não confunde prefixo parcial de nome", () => {
    expect(findActiveHref("/perfilx", items)).toBeUndefined();
  });
});

describe("AppShell", () => {
  it("marca só a página atual e renderiza o conteúdo", () => {
    mockPath = "/feed";
    render(<AppShell items={items}>conteúdo</AppShell>);
    expect(screen.getByRole("link", { name: "Editais" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Perfil" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("main")).toHaveTextContent("conteúdo");
  });

  it("só mostra Sair quando há onLogout", async () => {
    mockPath = "/feed";
    const onLogout = vi.fn();
    const { rerender } = render(<AppShell items={items}>x</AppShell>);
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();

    rerender(<AppShell items={items} onLogout={onLogout}>x</AppShell>);
    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
