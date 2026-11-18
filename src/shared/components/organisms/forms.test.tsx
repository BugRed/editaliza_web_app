import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AvatarPicker from "@/shared/components/molecules/AvatarPicker";
import PasswordChecklist from "@/shared/components/molecules/PasswordChecklist";
import { ImageUploadError } from "@/app/lib/image-upload";

// Função comum (não vi.fn): o rastreio de mocks do Vitest trata a promessa rejeitada devolvida por um vi.fn
// como rejeição não tratada, mesmo com o componente capturando o erro.
const upload = vi.hoisted(() => ({
  calls: [] as File[],
  impl: (async () => "") as (file: File) => Promise<string>,
}));
vi.mock("@/app/lib/image-upload", async (original) => ({
  ...(await original<typeof import("@/app/lib/image-upload")>()),
  fileToAvatarDataUrl: (file: File) => {
    upload.calls.push(file);
    return upload.impl(file);
  },
}));

beforeEach(() => {
  upload.calls.length = 0;
  upload.impl = async () => "";
});

describe("PasswordChecklist", () => {
  it("cada requisito aparece como 'falta' e vira 'cumprido' quando a senha passa a atender", () => {
    const { rerender } = render(<PasswordChecklist password="" />);
    expect(screen.getAllByText("(falta)")).toHaveLength(5);

    rerender(<PasswordChecklist password="abc" />);
    expect(screen.getByText(/uma letra minúscula/i).textContent).toContain("(cumprido)");
    expect(screen.getByText(/uma letra maiúscula/i).textContent).toContain("(falta)");

    rerender(<PasswordChecklist password="Senha@Forte9" />);
    expect(screen.queryByText("(falta)")).not.toBeInTheDocument();
    expect(screen.getAllByText("(cumprido)")).toHaveLength(5);
  });
});

describe("AvatarPicker", () => {
  const file = new File(["x"], "eu.png", { type: "image/png" });

  it("sem foto convida a escolher e marca o campo como obrigatório", () => {
    render(<AvatarPicker label="Sua foto de perfil" value="" onChange={vi.fn()} />);
    expect(screen.getByText("Escolher foto")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("quando opcional (logo da empresa) não mostra asterisco e diz que é opcional", () => {
    render(<AvatarPicker label="Logo da instituição" required={false} value="" onChange={vi.fn()} />);
    expect(screen.getByText("(opcional)")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("ao escolher uma imagem entrega o data URL pronto e oferece trocar", async () => {
    upload.impl = async () => "data:image/jpeg;base64,AAAA";
    const onChange = vi.fn();
    const { rerender } = render(<AvatarPicker label="Foto" value="" onChange={onChange} />);

    await userEvent.upload(document.querySelector("input[type=file]") as HTMLInputElement, file);

    expect(upload.calls).toEqual([file]);
    expect(onChange).toHaveBeenCalledWith("data:image/jpeg;base64,AAAA");

    rerender(<AvatarPicker label="Foto" value="data:image/jpeg;base64,AAAA" onChange={onChange} />);
    expect(screen.getByAltText("Prévia da sua foto")).toHaveAttribute("src", "data:image/jpeg;base64,AAAA");
    expect(screen.getByText("Trocar foto")).toBeInTheDocument();
  });

  it("arquivo recusado mostra o motivo, não altera o valor e não quebra", async () => {
    upload.impl = () => Promise.reject(new ImageUploadError("Use uma foto JPG, PNG ou WebP."));
    const onChange = vi.fn();
    render(<AvatarPicker label="Foto" value="" onChange={onChange} />);

    await userEvent.upload(document.querySelector("input[type=file]") as HTMLInputElement, new File(["x"], "a.png", { type: "image/png" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Use uma foto JPG, PNG ou WebP.");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("mostra o erro vindo do formulário (foto faltando)", () => {
    render(<AvatarPicker label="Foto" value="" onChange={vi.fn()} error="Escolha uma foto sua para continuar." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha uma foto sua para continuar.");
  });
});
