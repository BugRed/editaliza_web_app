import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PrivacyPanel from "@/shared/components/organisms/PrivacyPanel";

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:x");
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
});

describe("PrivacyPanel", () => {
  it("a visibilidade começa pública e muda ao escolher outra opção", async () => {
    render(<PrivacyPanel profile={{ name: "Ana" }} />);
    expect(screen.getByRole("radio", { name: /Público/ })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: /Só organizações/ }));
    expect(screen.getByRole("radio", { name: /Só organizações/ })).toBeChecked();
  });

  it("baixar os dados gera o arquivo e avisa", async () => {
    render(<PrivacyPanel profile={{ name: "Ana" }} />);
    await userEvent.click(screen.getByRole("button", { name: "Baixar meus dados" }));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("status")).toHaveTextContent("Arquivo gerado");
  });

  it("excluir só habilita depois de digitar a palavra, e cancelar fecha sem registrar nada", async () => {
    render(<PrivacyPanel profile={{}} />);
    await userEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));

    const confirm = screen.getAllByRole("button", { name: "Excluir minha conta" }).at(-1)!;
    expect(confirm).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/Digite EXCLUIR/), "excluir");
    expect(confirm).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText(/Pedido de exclusão/)).not.toBeInTheDocument();
  });

  it("confirmar a exclusão registra o pedido e diz que nada foi apagado", async () => {
    render(<PrivacyPanel profile={{}} />);
    await userEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    await userEvent.type(screen.getByLabelText(/Digite EXCLUIR/), "EXCLUIR");
    await userEvent.click(screen.getAllByRole("button", { name: "Excluir minha conta" }).at(-1)!);

    expect(screen.getByText(/Nenhum dado foi apagado/)).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
