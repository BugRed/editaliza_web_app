import { computeProfileCoverage, EMPTY_ONBOARDING, type OnboardingValues } from "@/shared/lib/onboarding";

describe("computeProfileCoverage", () => {
  it("perfil vazio tem cobertura zero e lista tudo como faltando, sem bloquear nada", () => {
    const coverage = computeProfileCoverage(EMPTY_ONBOARDING);
    expect(coverage.filled).toBe(0);
    expect(coverage.fraction).toBe(0);
    expect(coverage.missing).toHaveLength(coverage.total);
  });

  it("'não sei' continua contando como não informado", () => {
    expect(computeProfileCoverage({ ...EMPTY_ONBOARDING, canTravel: "unknown" }).filled).toBe(0);
  });

  it("'não' é uma resposta: conta como informado", () => {
    const coverage = computeProfileCoverage({ ...EMPTY_ONBOARDING, canTravel: "no" });
    expect(coverage.filled).toBe(1);
    expect(coverage.missing).not.toContain("Disponibilidade para viajar");
  });

  it("texto só com espaços não conta", () => {
    expect(computeProfileCoverage({ ...EMPTY_ONBOARDING, bio: "   " }).filled).toBe(0);
  });

  it("perfil completo chega a 100%", () => {
    const full: OnboardingValues = {
      artisticName: "Clara", bio: "b", statement: "s", languages: ["Pintura"], techniques: "óleo", themes: "memória",
      positioning: "contemporâneo", interests: ["Exposição"], canTravel: "yes", hasTeam: "no", hasDocumentation: "yes",
    };
    expect(computeProfileCoverage(full)).toMatchObject({ fraction: 1, missing: [] });
  });
});
