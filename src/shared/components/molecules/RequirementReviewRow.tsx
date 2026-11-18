import { pendingReasons, type ExtractedRequirement, type ReviewRole, type ReviewStrength } from "@/shared/lib/requirement-review";
import { SelectInput } from "@/shared/components/atoms/FormControls";
import CheckboxField from "@/shared/components/molecules/CheckboxField";

interface RequirementReviewRowProps {
  requirement: ExtractedRequirement;
  onChange: (patch: Partial<ExtractedRequirement>) => void;
  disabled?: boolean;
}

export default function RequirementReviewRow({ requirement, onChange, disabled = false }: RequirementReviewRowProps) {
  const reasons = pendingReasons(requirement);
  const idBase = `req-${requirement.id}`;

  return (
    <li className="rounded-xl border border-(--border-subtle) bg-(--bg-card) p-3 space-y-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-bold text-(--foreground)">{requirement.label}</p>
        <p className="text-xs text-(--text-subtle) tabular-nums">Confiança {Math.round(requirement.confidence * 100)}%</p>
      </div>

      <blockquote className="border-l-2 border-(--border-subtle) pl-3 text-xs text-(--text-muted)">
        {requirement.evidence ?? "Sem trecho do edital que sustente este requisito."}
      </blockquote>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor={`${idBase}-strength`} className="block text-xs font-bold text-(--foreground)">
            Força do requisito
          </label>
          <SelectInput
            id={`${idBase}-strength`}
            disabled={disabled}
            value={requirement.strength}
            onChange={(e) => onChange({ strength: e.target.value as ReviewStrength })}
          >
            <option value="explicit_mandatory">Obrigatório</option>
            <option value="preference">Preferência</option>
          </SelectInput>
        </div>
        {requirement.kind === "language" && (
          <div className="space-y-1">
            <label htmlFor={`${idBase}-role`} className="block text-xs font-bold text-(--foreground)">
              Papel da linguagem
            </label>
            <SelectInput
              id={`${idBase}-role`}
              disabled={disabled}
              value={requirement.role ?? ""}
              onChange={(e) => onChange({ role: (e.target.value || null) as ReviewRole })}
            >
              <option value="">Definir…</option>
              <option value="CORE">Núcleo</option>
              <option value="SUPPORT">Suporte</option>
            </SelectInput>
          </div>
        )}
      </div>

      <CheckboxField label="Conferi com o documento" checked={requirement.reviewed} onChange={(reviewed) => !disabled && onChange({ reviewed })} />

      {reasons.length > 0 && (
        <ul className="space-y-0.5 text-xs text-(--danger)">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
    </li>
  );
}
