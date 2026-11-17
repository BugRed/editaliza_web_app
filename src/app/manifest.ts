import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Editaliza",
    short_name: "Editaliza",
    description: "Editais culturais, em linguagem simples.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFB",
    theme_color: "#0E7C86",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
