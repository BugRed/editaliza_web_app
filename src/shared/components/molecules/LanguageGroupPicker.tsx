import { useState } from "react";
import { ALL_ART_TAGS, ART_LANGUAGE_GROUPS } from "@/app/lib/user-profiles";
import { TextInput } from "@/shared/components/atoms/FormControls";

const MAX_CUSTOM_LENGTH = 40;

interface LanguageGroupPickerProps {
  selected: string[];
  onChange: (languages: string[]) => void;
}

const GROUP_TITLE = "text-[11px] font-bold uppercase tracking-wider text-(--text-subtle)";

export default function LanguageGroupPicker({ selected, onChange }: LanguageGroupPickerProps) {
  const [otherLanguage, setOtherLanguage] = useState("");

  const toggle = (tag: string) =>
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);

  const addOther = () => {
    const language = otherLanguage.trim().slice(0, MAX_CUSTOM_LENGTH);
    if (!language) return;
    const exists = selected.some((item) => item.toLowerCase() === language.toLowerCase());
    if (!exists) onChange([...selected, language]);
    setOtherLanguage("");
  };

  const customLanguages = selected.filter((language) => !ALL_ART_TAGS.includes(language));

  return (
    <div className="space-y-3">
      <div>
        <span className="block text-sm font-bold text-(--foreground)">Linguagens principais</span>
        <p className="text-xs text-(--text-subtle)">
          Escolha todas que fazem parte do seu trabalho. {selected.length}{" "}
          {selected.length === 1 ? "selecionada" : "selecionadas"}.
        </p>
      </div>
      {ART_LANGUAGE_GROUPS.map((group) => (
        <fieldset key={group.group} className="space-y-1.5">
          <legend className={GROUP_TITLE}>{group.group}</legend>
          <div className="flex flex-wrap gap-2">
            {group.languages.map((tag) => {
              const active = selected.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    active
                      ? "bg-(--primary) border-(--primary-fg) text-white"
                      : "bg-(--bg-card) border-(--border-subtle) text-(--text-muted) hover:border-(--primary-fg)"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {customLanguages.length > 0 && (
        <fieldset className="space-y-1.5">
          <legend className={GROUP_TITLE}>Suas linguagens</legend>
          <div className="flex flex-wrap gap-2">
            {customLanguages.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed="true"
                aria-label={`Remover ${tag}`}
                onClick={() => toggle(tag)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-(--primary) border-(--primary-fg) text-white cursor-pointer"
              >
                {tag} ×
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="flex gap-2">
        <TextInput
          type="text"
          aria-label="Outra linguagem"
          className="min-w-0 flex-1 py-2"
          maxLength={MAX_CUSTOM_LENGTH}
          placeholder="Não achou a sua? Digite outra (ex: Cordel)"
          value={otherLanguage}
          onChange={(e) => setOtherLanguage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            addOther();
          }}
        />
        <button
          type="button"
          onClick={addOther}
          className="px-4 py-2 rounded-xl bg-(--accent) text-(--on-accent) text-sm font-bold hover:bg-(--accent-hover) cursor-pointer"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
