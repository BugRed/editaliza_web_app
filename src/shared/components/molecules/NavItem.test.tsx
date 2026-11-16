import { render, screen } from "@testing-library/react";
import { Home } from "lucide-react";

import { NavItem } from "@/shared/components/molecules/NavItem";

describe("NavItem", () => {
  it("indica a página atual só quando ativo", () => {
    render(
      <>
        <NavItem href="/feed" label="Início" icon={Home} active />
        <NavItem href="/salvos" label="Salvos" icon={Home} />
      </>,
    );
    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Salvos" })).not.toHaveAttribute("aria-current");
  });
});
