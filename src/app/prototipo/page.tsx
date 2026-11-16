import Link from "next/link";

import { Badge } from "@/shared/components/atoms/Badge";
import { PageHeader } from "@/shared/components/molecules/PageHeader";
import { SCREENS } from "@/shared/fixtures/screen-map";

export default function PrototypeIndexPage() {
  return (
    <>
      <PageHeader title="Mapa de telas" description="Protótipo navegável. Login e cadastro já são telas reais (/login, /cadastro)." />
      <ul className="flex flex-col gap-3" aria-label="Telas">
        {SCREENS.map((screen) => (
          <li key={screen.number} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface p-4 shadow-card">
            <div>
              <Link href={screen.href} className="font-medium text-primary hover:underline">
                {screen.number}. {screen.name}
              </Link>
              <p className="text-sm text-ink-muted">
                {screen.role} · entra no ar na {screen.wave}
              </p>
            </div>
            <ul className="flex gap-2" aria-label={`Estados de ${screen.name}`}>
              {screen.states.map((state) => (
                <li key={state.href}>
                  <Link href={state.href} className="text-sm text-ink-muted hover:underline">
                    <Badge>{state.label}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}
