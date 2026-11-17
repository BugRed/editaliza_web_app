import { formatCnpj, formatCpf, isValidCpf, onlyDigits } from "@/shared/lib/documents";

describe("formatCpf (máscara enquanto digita)", () => {
  it.each([
    ["", ""],
    ["5", "5"],
    ["529", "529"],
    ["5299", "529.9"],
    ["529982", "529.982"],
    ["5299822", "529.982.2"],
    ["529982247", "529.982.247"],
    ["5299822472", "529.982.247-2"],
    ["52998224725", "529.982.247-25"],
  ])("%j vira %j", (typed, masked) => {
    expect(formatCpf(typed)).toBe(masked);
  });

  it("ignora letras e pontuação e corta em 11 dígitos", () => {
    expect(formatCpf("52a9.98!2-247/25")).toBe("529.982.247-25");
    expect(formatCpf("5299822472599999")).toBe("529.982.247-25");
  });

  it("é estável: aplicar a máscara de novo no valor já mascarado não muda nada", () => {
    expect(formatCpf(formatCpf("52998224725"))).toBe("529.982.247-25");
  });
});

describe("formatCnpj", () => {
  it("mascara por etapas e corta em 14 dígitos", () => {
    expect(formatCnpj("11")).toBe("11");
    expect(formatCnpj("11222")).toBe("11.222");
    expect(formatCnpj("11222333")).toBe("11.222.333");
    expect(formatCnpj("112223330001")).toBe("11.222.333/0001");
    expect(formatCnpj("11222333000144")).toBe("11.222.333/0001-44");
    expect(formatCnpj("1122233300014499")).toBe("11.222.333/0001-44");
  });
});

describe("isValidCpf", () => {
  it("aceita CPF real, com ou sem máscara", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
  });

  it("recusa dígito verificador errado, tamanho errado e sequência repetida", () => {
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("529.982.247")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("000.000.000-00")).toBe(false);
    expect(isValidCpf("")).toBe(false);
  });
});

it("onlyDigits remove tudo que não é número", () => {
  expect(onlyDigits("12.3-4/5 a")).toBe("12345");
});
