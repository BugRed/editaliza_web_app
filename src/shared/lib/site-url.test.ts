import { resolveSiteUrl } from "@/shared/lib/site-url";

describe("resolveSiteUrl", () => {
  it("SITE_URL vence e perde a barra final", () => {
    expect(resolveSiteUrl({ SITE_URL: "https://editaliza.com.br/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" })).toBe("https://editaliza.com.br");
  });

  it("sem SITE_URL, usa o domínio de produção da Vercel, que vem sem protocolo", () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "editaliza-web-app.vercel.app" })).toBe("https://editaliza-web-app.vercel.app");
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "https://x.vercel.app/" })).toBe("https://x.vercel.app");
  });

  it("sem nada (ou só espaços), cai no servidor local", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
    expect(resolveSiteUrl({ SITE_URL: "  ", VERCEL_PROJECT_PRODUCTION_URL: "" })).toBe("http://localhost:3000");
  });
});
