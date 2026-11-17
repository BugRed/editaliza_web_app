"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, Plus, Trash2 } from "lucide-react";
import { useEditals } from "@/app/hooks/useEditals";
import { useSocialStore } from "@/app/hooks/useSocialStore";
import type { ArtistProfile } from "@/app/lib/user-profiles";
import { getEditalProposerId } from "@/shared/lib/edital-owner";

const FIELD =
  "w-full px-3.5 py-2.5 rounded-xl bg-(--bg-card) border border-(--border-subtle) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary-fg) focus:border-(--primary-fg)";
const OTHER_EDITAL = "outro";

interface BadgeManagerProps {
  profile: ArtistProfile;
  availableCategories: string[];
}

export default function BadgeManager({ profile, availableCategories }: BadgeManagerProps) {
  const { addBadgeToCurrentProfile, removeBadgeFromCurrentProfile, proposers } = useSocialStore();
  const { editais } = useEditals();

  const [result, setResult] = useState("Selecionado");
  const [editalChoice, setEditalChoice] = useState(OTHER_EDITAL);
  const [editalName, setEditalName] = useState("");
  const [category, setCategory] = useState(availableCategories[0] ?? "Pintura");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [added, setAdded] = useState(false);

  const chosen = editais.find((item) => String(item.id) === editalChoice);
  const issuer = chosen ? proposers.find((item) => item.id === getEditalProposerId(chosen)) : undefined;
  const nameToSave = chosen ? chosen.title : editalName.trim();

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!nameToSave) return;
    await addBadgeToCurrentProfile({
      title: result.trim() || "Selecionado",
      editalName: nameToSave,
      year: year.trim() || String(new Date().getFullYear()),
      category,
      ...(chosen ? { editalId: chosen.id } : {}),
      ...(issuer ? { issuerId: issuer.id, issuerName: issuer.name } : {}),
    });
    setEditalName("");
    setEditalChoice(OTHER_EDITAL);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Award size={18} className="text-(--primary-fg)" aria-hidden="true" />
        <h2 className="text-base font-bold text-(--foreground)">Badges conquistadas em editais ({profile.badges.length})</h2>
      </div>

      {added && <div className="rounded-xl border border-(--primary-fg)/30 bg-(--primary-soft) p-3 text-sm font-medium text-(--primary-ink)">Badge registrada no perfil!</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="badge-result" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Resultado
          </label>
          <input id="badge-result" type="text" value={result} onChange={(e) => setResult(e.target.value)} placeholder="Ex.: Contemplado" className={FIELD} />
        </div>
        <div>
          <label htmlFor="badge-edital" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Edital
          </label>
          <select id="badge-edital" value={editalChoice} onChange={(e) => setEditalChoice(e.target.value)} className={FIELD}>
            <option value={OTHER_EDITAL}>Outro edital (digitar o nome)</option>
            {editais.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {chosen ? (
        <p className="text-xs text-(--text-muted)">
          Este selo vai ligar ao edital{issuer ? <> e à empresa <strong>{issuer.name}</strong></> : ""}.
        </p>
      ) : (
        <div>
          <label htmlFor="badge-name" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Nome do edital
          </label>
          <input id="badge-name" type="text" value={editalName} onChange={(e) => setEditalName(e.target.value)} className={FIELD} required />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem]">
        <div>
          <label htmlFor="badge-category" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Área
          </label>
          <select id="badge-category" value={category} onChange={(e) => setCategory(e.target.value)} className={FIELD}>
            {availableCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="badge-year" className="mb-1 block text-xs font-bold text-(--text-subtle)">
            Ano
          </label>
          <input id="badge-year" type="text" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} className={`${FIELD} tabular-nums`} />
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-(--primary-fg) px-4 py-2 text-sm font-bold text-(--primary-fg) transition-colors hover:bg-(--primary-soft)"
      >
        <Plus size={16} />
        <span>Adicionar conquista</span>
      </button>

      {profile.badges.length > 0 && (
        <ul className="space-y-2 pt-1">
          {profile.badges.map((badge) => (
            <li key={badge.id} className="flex items-center justify-between gap-3 rounded-xl border border-(--border-subtle) bg-(--background) p-2.5">
              <Link href={`/perfil/${profile.id}/selos/${badge.id}`} className="min-w-0 flex-1 hover:underline">
                <p className="break-words text-sm font-bold text-(--foreground)">
                  {badge.title} — {badge.editalName}
                </p>
                <p className="text-xs text-(--text-subtle)">
                  {badge.category} · <span className="tabular-nums">{badge.year}</span>
                  {badge.issuerName ? ` · ${badge.issuerName}` : ""}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => void removeBadgeFromCurrentProfile(badge.id)}
                aria-label={`Remover badge ${badge.editalName}`}
                className="shrink-0 cursor-pointer rounded-lg p-2 text-(--text-subtle) transition-colors hover:bg-(--danger-soft) hover:text-(--danger)"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
