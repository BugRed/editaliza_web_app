import { checkRejection, rejectionLabel } from "@/shared/lib/rejection";

describe("checkRejection", () => {
  it("sem motivo escolhido não rejeita", () => {
    expect(checkRejection({ reason: "", otherText: "" })).toMatch(/motivo/);
  });

  it("motivo da lista basta", () => {
    expect(checkRejection({ reason: "DEADLINE", otherText: "" })).toBeNull();
  });

  it("'outro motivo' exige uma frase, ignorando espaços", () => {
    expect(checkRejection({ reason: "OTHER", otherText: "  " })).toMatch(/poucas palavras/);
    expect(checkRejection({ reason: "OTHER", otherText: "Fica longe de casa" })).toBeNull();
  });
});

describe("rejectionLabel", () => {
  it("devolve o texto em português do motivo", () => {
    expect(rejectionLabel("DONE")).toBe("Já participei");
  });
});
