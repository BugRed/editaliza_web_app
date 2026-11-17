import { Check, Circle } from "lucide-react";

import { PASSWORD_RULES } from "@/shared/lib/password-policy";

// Lista ao vivo das regras de senha: cada item acende quando é cumprido. O texto diz o estado (não só a cor).
export default function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul aria-label="Requisitos da senha" className="grid grid-cols-1 gap-x-4 gap-y-1 pt-1 sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${ok ? "font-semibold text-[#0E7C86]" : "text-[#6B8388]"}`}>
            {ok ? <Check size={13} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
            <span>
              {rule.label}
              <span className="sr-only">{ok ? " (cumprido)" : " (falta)"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
