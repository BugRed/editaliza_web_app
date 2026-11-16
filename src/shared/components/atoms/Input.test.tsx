import { render, screen } from "@testing-library/react";

import { Input } from "@/shared/components/atoms/Input";

describe("Input", () => {
  it("marca o campo como inválido para tecnologia assistiva", () => {
    render(<Input aria-label="E-mail" invalid />);
    expect(screen.getByRole("textbox", { name: "E-mail" })).toBeInvalid();
  });

  it("não marca inválido por padrão", () => {
    render(<Input aria-label="E-mail" />);
    expect(screen.getByRole("textbox", { name: "E-mail" })).toBeValid();
  });
});
