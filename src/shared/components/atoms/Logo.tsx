import Image from "next/image";

import { fraunces } from "@/app/lib/brand-font";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** Símbolo: o "e" com o ponto final âmbar. Duas imagens e o CSS (globals.css) mostra a do tema ativo: assim o servidor não precisa saber o tema do sistema. */
export function LogoMark({ size = 36, className }: LogoMarkProps) {
  return (
    <>
      <Image src="/brand/mark.svg" alt="" width={size} height={size} unoptimized className={`only-light ${className ?? ""}`} priority />
      <Image src="/brand/mark-dark.svg" alt="" width={size} height={size} unoptimized className={`only-dark ${className ?? ""}`} priority />
    </>
  );
}

interface WordmarkProps {
  className?: string;
}

/**
 * Nome em texto vivo (Fraunces 600) para o corte óptico acompanhar o tamanho; o ponto é a assinatura da
 * marca. Os arquivos em public/brand e a og-image usam as mesmas letras já em curvas.
 */
export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span className={`${fraunces.className} font-semibold tracking-[-0.02em] text-(--primary-fg) ${className}`}>
      editaliza<span className="text-(--accent)">.</span>
    </span>
  );
}

interface LogoProps {
  markSize?: number;
  wordmarkClassName?: string;
}

export function Logo({ markSize = 36, wordmarkClassName = "text-[1.7rem] leading-none" }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={markSize} />
      <Wordmark className={wordmarkClassName} />
    </span>
  );
}
