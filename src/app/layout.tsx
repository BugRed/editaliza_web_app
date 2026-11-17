import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./hooks/useAuth";
import { SocialStoreProvider } from "./hooks/useSocialStore";

export const metadata: Metadata = {
  title: "Editaliza — Rede de Editais e Artistas",
  description: "Descubra editais culturais, conecte-se com artistas e acompanhe oportunidades sem complicação.",
  openGraph: {
    title: "Editaliza — Rede de Editais e Artistas",
    description: "Descubra editais culturais, conecte-se com artistas e acompanhe oportunidades sem complicação.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="bg-[#F8FAFB] text-[#102A30]">
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