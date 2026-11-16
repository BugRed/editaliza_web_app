import { render, screen } from "@testing-library/react";

import { EmptyState } from "@/shared/components/molecules/EmptyState";

describe("EmptyState", () => {
  it("mostra título e ação", () => {
    render(<EmptyState title="Nada salvo" action={<button>Ver feed</button>} />);
    expect(screen.getByRole("heading", { name: "Nada salvo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver feed" })).toBeInTheDocument();
  });
});
