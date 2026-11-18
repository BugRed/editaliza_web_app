import { render, screen } from "@testing-library/react";

import AdSlot from "@/shared/components/molecules/AdSlot";

describe("AdSlot", () => {
  it.each(["rail", "sidebar", "feed"] as const)("variante %s é rotulada como publicidade", (variant) => {
    render(<AdSlot variant={variant} />);
    expect(screen.getByLabelText("Publicidade")).toBeInTheDocument();
    expect(screen.getByText("Publicidade")).toBeInTheDocument();
  });

  it("o link é patrocinado, abre em outra aba e não vaza a origem", () => {
    render(<AdSlot variant="feed" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("rel", "sponsored noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("slots diferentes mostram anúncios diferentes", () => {
    const { rerender } = render(<AdSlot variant="rail" slot={0} />);
    const first = screen.getByRole("link").textContent;
    rerender(<AdSlot variant="rail" slot={1} />);
    expect(screen.getByRole("link").textContent).not.toBe(first);
  });

  it("os banners da lateral e da direita levam imagem, para serem maiores que um texto solto", () => {
    const { container, rerender } = render(<AdSlot variant="rail" />);
    expect(container.querySelector("img")).not.toBeNull();
    rerender(<AdSlot variant="sidebar" />);
    expect(container.querySelector("img")).not.toBeNull();
  });
});
