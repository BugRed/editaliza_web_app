import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CadastroPage from "@/app/(auth)/cadastro/page";

const register = vi.hoisted(() => ({ calls: [] as unknown[], result: { success: true } as { success: boolean; message?: string } }));
vi.mock("@/app/hooks/useAuth", () => ({
  useAuth: () => ({
    register: async (payload: unknown) => {
      register.calls.push(payload);
      return register.result;
    },
  }),
}));
// next/font só existe dentro do compilador do Next.
vi.mock("@/app/lib/brand-font", () => ({ fraunces: { className: "font-mock", variable: "--font-fraunces" } }));
// Função comum: ver forms.test.tsx sobre o rastreio de mocks.
vi.mock("@/app/lib/image-upload", async (original) => ({
  ...(await original<typeof import("@/app/lib/image-upload")>()),
  fileToAvatarDataUrl: async () => "data:image/jpeg;base64,AAAA",
}));

const STRONG = "Senha@Forte9";
const photo = () => new File(["x"], "eu.png", { type: "image/png" });
const field = (name: RegExp | string) => screen.getByLabelText(name) as HTMLInputElement;

async function fillArtist({ withPhoto = true, password = STRONG, cpf = "" } = {}) {
  await userEvent.type(field("Nome completo"), "Clara Mendes");
  await userEvent.type(field(/^E-mail/i), "clara@x.com");
  await userEvent.type(field(/^Senha/i), password);
  if (cpf) await userEvent.type(field(/CPF/i), cpf);
  if (withPhoto) await userEvent.upload(document.querySelector("input[type=file]") as HTMLInputElement, photo());
}

const submit = () => userEvent.click(screen.getByRole("button", { name: /Cadastrar como Artista/ }));

beforeEach(() => {
  register.calls.length = 0;
  register.result = { success: true };
});

describe("cadastro: máscaras", () => {
  it("CPF ganha a máscara enquanto digita e ignora letras", async () => {
    render(<CadastroPage />);
    await userEvent.type(field(/CPF/i), "52a998.224/725");
    expect(field(/CPF/i).value).toBe("529.982.247-25");
  });

  it("CNPJ do propositor ganha a máscara", async () => {
    render(<CadastroPage />);
    await userEvent.click(screen.getByRole("tab", { name: /Sou Propositor/ }));
    await userEvent.type(field(/CNPJ da organização/i), "11222333000144");
    expect(field(/CNPJ da organização/i).value).toBe("11.222.333/0001-44");
  });
});

describe("cadastro: senha forte", () => {
  it("a lista de requisitos acompanha o que a pessoa digita", async () => {
    render(<CadastroPage />);
    const list = screen.getByRole("list", { name: "Requisitos da senha" });
    expect(list.textContent).toContain("(falta)");
    await userEvent.type(field(/^Senha/i), STRONG);
    expect(list.textContent).not.toContain("(falta)");
  });

  it("senha fraca não envia e mostra a regra completa", async () => {
    render(<CadastroPage />);
    await fillArtist({ password: "senha123" });
    await submit();
    expect(screen.getByText(/letra maiúscula, minúscula, número e símbolo/)).toBeInTheDocument();
    expect(register.calls).toHaveLength(0);
  });
});

describe("cadastro: foto obrigatória", () => {
  it("sem foto não envia e aponta o campo", async () => {
    render(<CadastroPage />);
    await fillArtist({ withPhoto: false });
    await submit();
    expect(screen.getByText("Escolha uma foto sua para continuar.")).toBeInTheDocument();
    expect(register.calls).toHaveLength(0);
  });

  it("com foto a prévia aparece e o envio leva a imagem junto", async () => {
    render(<CadastroPage />);
    await fillArtist();
    expect(await screen.findByAltText("Prévia da sua foto")).toBeInTheDocument();
    await submit();
    expect(register.calls).toHaveLength(1);
    expect(register.calls[0]).toMatchObject({ userType: "ARTIST", email: "clara@x.com", avatarDataUrl: "data:image/jpeg;base64,AAAA" });
  });

  it("o logo da instituição é opcional: sem ele envia, com ele leva a imagem", async () => {
    render(<CadastroPage />);
    await userEvent.click(screen.getByRole("tab", { name: /Sou Propositor/ }));
    expect(screen.getByText("(opcional)")).toBeInTheDocument();
    await userEvent.type(field("Nome da instituição"), "Instituto Novo");
    await userEvent.type(field(/^E-mail/i), "i@x.com");
    await userEvent.type(field(/^Senha/i), STRONG);
    await userEvent.type(field(/CNPJ da organização/i), "11222333000144");

    await userEvent.click(screen.getByRole("button", { name: /Cadastrar como Propositor/ }));
    expect(register.calls).toHaveLength(1);
    expect(register.calls[0]).toMatchObject({ userType: "PROPOSER", avatarDataUrl: undefined });

    await userEvent.upload(document.querySelector("input[type=file]") as HTMLInputElement, photo());
    await userEvent.click(screen.getByRole("button", { name: /Cadastrar como Propositor/ }));
    expect(register.calls[1]).toMatchObject({ avatarDataUrl: "data:image/jpeg;base64,AAAA" });
  });
});

describe("cadastro: CPF", () => {
  it("CPF com dígito errado não envia; CPF correto envia mascarado", async () => {
    render(<CadastroPage />);
    await fillArtist({ cpf: "52998224724" });
    await submit();
    expect(screen.getByText("CPF inválido. Confira os números.")).toBeInTheDocument();
    expect(register.calls).toHaveLength(0);

    await userEvent.clear(field(/CPF/i));
    await userEvent.type(field(/CPF/i), "52998224725");
    await submit();
    expect(register.calls[0]).toMatchObject({ cpf: "529.982.247-25" });
  });

  it("CPF é opcional: em branco envia", async () => {
    render(<CadastroPage />);
    await fillArtist();
    await submit();
    expect(register.calls).toHaveLength(1);
  });
});

describe("cadastro: linguagens", () => {
  it("há muito mais opções do que as 8 antigas, agrupadas por área", () => {
    render(<CadastroPage />);
    expect(screen.getAllByRole("group").length).toBeGreaterThanOrEqual(6);
    for (const name of ["Cinema", "Cerâmica", "Poesia", "Capoeira", "Design", "Circo", "Gravura"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button", { pressed: false }).length).toBeGreaterThan(30);
  });

  it("escolher e desfazer uma linguagem atualiza a contagem", async () => {
    render(<CadastroPage />);
    expect(screen.getByText(/1\s+selecionada\./)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cinema" }));
    expect(screen.getByText(/2\s+selecionadas\./)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cinema" }));
    expect(screen.getByText(/1\s+selecionada\./)).toBeInTheDocument();
  });

  it("quem não acha a sua digita outra, e ela vai no envio; repetida não duplica", async () => {
    render(<CadastroPage />);
    await userEvent.type(field("Outra linguagem"), "Cordel{Enter}");
    await userEvent.type(field("Outra linguagem"), "cordel{Enter}");
    expect(screen.getAllByRole("button", { name: "Remover Cordel" })).toHaveLength(1);

    await fillArtist();
    await submit();
    expect((register.calls[0] as { coreLanguages: string[] }).coreLanguages).toEqual(["Pintura", "Cordel"]);
  });
});

it("erro do servidor aparece e não perde o que foi digitado", async () => {
  register.result = { success: false, message: "Este e-mail já está cadastrado." };
  render(<CadastroPage />);
  await fillArtist();
  await submit();
  expect(await screen.findByText("Este e-mail já está cadastrado.")).toBeInTheDocument();
  expect(field("Nome completo").value).toBe("Clara Mendes");
});
