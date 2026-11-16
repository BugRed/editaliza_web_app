import { render, screen } from "@testing-library/react";

import { Input } from "@/shared/components/atoms/Input";
import { FormField } from "@/shared/components/molecules/FormField";

function renderField(props: { hint?: string; error?: string }) {
  render(
    <FormField label="E-mail" {...props}>
      {(control) => <Input {...control} />}
    </FormField>,
  );
  return screen.getByRole("textbox", { name: "E-mail" });
}

describe("FormField", () => {
  it("liga o rótulo ao campo", () => {
    expect(renderField({})).toBeInTheDocument();
  });

  it("descreve o campo pela dica quando não há erro", () => {
    expect(renderField({ hint: "Use o e-mail do cadastro" })).toHaveAccessibleDescription(
      "Use o e-mail do cadastro",
    );
  });

  it("o erro invalida o campo, é anunciado e substitui a dica", () => {
    const field = renderField({ hint: "dica", error: "E-mail inválido" });
    expect(field).toBeInvalid();
    expect(field).toHaveAccessibleDescription("E-mail inválido");
    expect(screen.getByRole("alert")).toHaveTextContent("E-mail inválido");
    expect(screen.queryByText("dica")).not.toBeInTheDocument();
  });
});
