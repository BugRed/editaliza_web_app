import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "./hooks/useAuth";
import { SocialStoreProvider } from "./hooks/useSocialStore";
import { fraunces } from "./lib/brand-font";
import { env } from "@/shared/lib/env";
import { resolveSiteUrl } from "@/shared/lib/site-url";
import { parseThemePreference, themeAttribute, THEME_COOKIE } from "@/shared/lib/theme";

const TITLE = "Editaliza: editais culturais, em linguagem simples";
const DESCRIPTION =
  "Descubra editais culturais, conecte-se com artistas e acompanhe oportunidades sem complicação.";

// As imagens (og-image, favicon, ícone de celular) vêm das convenções de arquivo em src/app; o
// metadataBase só dá o endereço absoluto a elas.
export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl({ SITE_URL: env.SITE_URL, VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL })),
  title: { default: TITLE, template: "%s · Editaliza" },
  description: DESCRIPTION,
  applicationName: "Editaliza",
  openGraph: { type: "website", siteName: "Editaliza", locale: "pt_BR", title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = {
  // Só acompanha o sistema: com tema escolhido à mão o navegador não deixa o servidor trocar isso por cookie.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0E7C86" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1417" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = themeAttribute(parseThemePreference((await cookies()).get(THEME_COOKIE)?.value));
  return (
    <html lang="pt-BR" data-theme={theme} className={`${fraunces.variable} bg-(--background) text-(--foreground)`}>
      <body className="antialiased min-h-screen bg-(--background) text-(--foreground)">
        <AuthProvider>
          <SocialStoreProvider>
            {children}
          </SocialStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
