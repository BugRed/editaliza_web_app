export interface SiteUrlSource {
  SITE_URL?: string;
  /** Domínio de produção que a Vercel define sozinha, sem protocolo (ex.: editaliza-web-app.vercel.app). */
  VERCEL_PROJECT_PRODUCTION_URL?: string;
}

const LOCAL_URL = "http://localhost:3000";

/**
 * Endereço público do site, usado para os links absolutos de og-image e ícones. `SITE_URL` vence (domínio próprio
 * depois); sem ela vale o domínio de produção da Vercel; sem nenhum dos dois, o servidor local.
 */
export function resolveSiteUrl(source: SiteUrlSource): string {
  const explicit = source.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = source.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  return LOCAL_URL;
}
