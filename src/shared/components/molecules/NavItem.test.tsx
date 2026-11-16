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

  it("mostra o contador só quando maior que zero", () => {
    const { rerender } = render(<NavItem href="/salvos" label="Salvos" icon={Home} count={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    rerender(<NavItem href="/salvos" label="Salvos" icon={Home} count={0} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
