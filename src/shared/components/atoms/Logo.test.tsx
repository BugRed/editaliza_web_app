import { render, screen } from "@testing-library/react";

import { Logo, LogoMark, Wordmark } from "@/shared/components/atoms/Logo";

// next/font só existe dentro do compilador do Next.
vi.mock("@/app/lib/brand-font", () => ({ fraunces: { className: "font-mock", variable: "--font-fraunces" } }));

describe("Logo", () => {
  it("o símbolo é decorativo (alt vazio) e aponta para o arquivo da marca", () => {
    const { container } = render(<LogoMark size={40} />);
    const image = container.querySelector("img") as HTMLImageElement;
    expect(image.getAttribute("alt")).toBe("");
    expect(image.getAttribute("src")).toContain("/brand/mark.svg");
    expect(image).toHaveAttribute("width", "40");
  });

  it("o nome é 'editaliza' com o ponto final em âmbar, e o texto lido é 'editaliza.'", () => {
    render(<Wordmark />);
    const word = screen.getByText(/editaliza/);
    expect(word).toHaveTextContent("editaliza.");
    expect(word.querySelector("span")).toHaveTextContent(".");
    expect(word.querySelector("span")?.className).toContain("--accent");
  });

  it("a logo completa traz símbolo e nome juntos", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("img")).not.toBeNull();
    expect(container).toHaveTextContent("editaliza.");
  });
});
