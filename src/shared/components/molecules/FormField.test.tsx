import { render, screen } from "@testing-library/react";

import FormField from "@/shared/components/molecules/FormField";
import { TextInput } from "@/shared/components/atoms/FormControls";

describe("FormField", () => {
  it("liga o rótulo ao campo, para leitor de tela e para clique no texto", () => {
    render(
      <FormField id="nome" label="Nome">
        <TextInput id="nome" defaultValue="Ana" />
      </FormField>
    );
    expect(screen.getByLabelText("Nome")).toHaveValue("Ana");
  });
});
