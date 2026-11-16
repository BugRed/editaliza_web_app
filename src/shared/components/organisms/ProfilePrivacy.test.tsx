import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProfilePrivacy } from "@/shared/components/organisms/ProfilePrivacy";

describe("ProfilePrivacy", () => {
  it("excluir exige confirmação: cancelar não apaga", async () => {
    const onDelete = vi.fn();
    render(<ProfilePrivacy email="a@b.com" onDelete={onDelete} />);

    await userEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("confirmar a exclusão chama onDelete e avisa", async () => {
    const onDelete = vi.fn();
    render(<ProfilePrivacy email="a@b.com" onDelete={onDelete} />);

    await userEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    await userEvent.click(screen.getByRole("button", { name: "Excluir conta" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent(/exclusão registrado/i);
  });

  it("exportar chama onExport e avisa", async () => {
    const onExport = vi.fn();
    render(<ProfilePrivacy email="a@b.com" onExport={onExport} />);
    await userEvent.click(screen.getByRole("button", { name: "Exportar meus dados" }));
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent(/exportação/i);
  });
});
