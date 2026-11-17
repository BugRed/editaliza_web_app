import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "./hooks/useAuth";
import { SocialStoreProvider } from "./hooks/useSocialStore";
import { fraunces } from "./lib/brand-font";
import { env } from "@/shared/lib/env";
import { resolveSiteUrl } from "@/shared/lib/site-url";

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
  themeColor: "#0E7C86",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} bg-[#F8FAFB] text-[#102A30]`}>
      <body className="antialiased min-h-screen bg-[#F8FAFB] text-[#102A30]">
        <AuthProvider>
          <SocialStoreProvider>
            {children}
          </SocialStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
