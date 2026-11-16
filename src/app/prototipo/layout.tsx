import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { PrototypeShell } from "@/shared/components/organisms/PrototypeShell";

// Dados fixos não podem ir ao ar por engano: em produção a rota some.
export default function PrototypeLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <PrototypeShell>{children}</PrototypeShell>;
}
