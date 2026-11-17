import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LanguageGroupPicker from "@/shared/components/molecules/LanguageGroupPicker";

describe("LanguageGroupPicker", () => {
  it("adiciona uma linguagem própria uma vez só, sem diferenciar maiúsculas", async () => {
    const onChange = vi.fn();
    render(<LanguageGroupPicker selected={["Cordel"]} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Outra linguagem"), "cordel{Enter}");
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText("Outra linguagem"), "Repente{Enter}");
    expect(onChange).toHaveBeenCalledWith(["Cordel", "Repente"]);
  });

  it("uma linguagem própria já escolhida pode ser removida", async () => {
    const onChange = vi.fn();
    render(<LanguageGroupPicker selected={["Cordel"]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Remover Cordel" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
