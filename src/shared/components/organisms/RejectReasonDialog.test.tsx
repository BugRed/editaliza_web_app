import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RejectReasonDialog } from "@/shared/components/organisms/RejectReasonDialog";

describe("RejectReasonDialog", () => {
  it("só habilita dispensar depois de escolher um motivo, e entrega o motivo", async () => {
    const onConfirm = vi.fn();
    render(<RejectReasonDialog open onConfirm={onConfirm} onCancel={vi.fn()} />);
    const confirm = screen.getByRole("button", { name: "Dispensar edital" });
    expect(confirm).toBeDisabled();

    await userEvent.selectOptions(screen.getByLabelText("Motivo"), "Prazo curto demais");
    await userEvent.click(confirm);

    expect(onConfirm).toHaveBeenCalledWith("Prazo curto demais");
  });

  it("Escape cancela", async () => {
    const onCancel = vi.fn();
    render(<RejectReasonDialog open onConfirm={vi.fn()} onCancel={onCancel} />);
    await userEvent.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
