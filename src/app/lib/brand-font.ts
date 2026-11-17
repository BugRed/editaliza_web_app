import { Fraunces } from "next/font/google";

// Fonte variável com o eixo de corte óptico (opsz), para o nome ficar fino em tamanho grande e robusto em
// pequeno. A marca usa o peso 600, que vem da classe font-semibold. Variável CSS para o layout expor.
export const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
