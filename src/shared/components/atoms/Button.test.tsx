import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "@/shared/components/atoms/Button";

describe("Button", () => {
  it("não dispara clique enquanto carrega e avisa o estado ocupado", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Salvar
      </Button>,
    );
    const button = screen.getByRole("button", { name: /salvar/i });

    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("não envia formulário por engano: o tipo padrão é button", () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole("button", { name: "Ok" })).toHaveAttribute("type", "button");
  });
});
