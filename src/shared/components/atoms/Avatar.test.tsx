import { render, screen } from "@testing-library/react";

import { Avatar, getInitials } from "@/shared/components/atoms/Avatar";

describe("getInitials", () => {
  it.each([
    ["Maria da Silva", "MS"],
    ["  ana  ", "A"],
    ["", "?"],
  ])("%j vira %j", (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});

describe("Avatar", () => {
  it("usa a imagem quando há src", () => {
    render(<Avatar name="Maria Silva" src="/m.png" />);
    expect(screen.getByRole("img", { name: "Maria Silva" })).toHaveAttribute("src", "/m.png");
  });

  it("cai nas iniciais sem src, ainda com nome acessível", () => {
    render(<Avatar name="Maria Silva" />);
    expect(screen.getByRole("img", { name: "Maria Silva" })).toHaveTextContent("MS");
  });
});
