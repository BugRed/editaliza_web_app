import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // O postcss.config.mjs do app usa o plugin do Tailwind por nome, que o Vite do Vitest não resolve;
  // os testes verificam comportamento, não estilo, então o PostCSS fica vazio aqui.
  css: { postcss: { plugins: [] } },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
