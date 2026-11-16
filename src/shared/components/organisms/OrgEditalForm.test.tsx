import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OrgEditalForm } from "@/shared/components/organisms/OrgEditalForm";

describe("OrgEditalForm", () => {
  it("sem título não salva e aponta o campo", async () => {
    const onSaveDraft = vi.fn();
    render(<OrgEditalForm onSaveDraft={onSaveDraft} />);

    await userEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    expect(screen.getByLabelText("Título")).toBeInvalid();
    expect(onSaveDraft).not.toHaveBeenCalled();
  });

  it("com título salva o rascunho sem espaços sobrando", async () => {
    const onSaveDraft = vi.fn();
    render(<OrgEditalForm onSaveDraft={onSaveDraft} />);
    await userEvent.type(screen.getByLabelText("Título"), "  Prêmio X ");

    await userEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    expect(onSaveDraft).toHaveBeenCalledWith("Prêmio X");
    expect(screen.getByRole("status")).toHaveTextContent("Rascunho salvo");
  });
});
