"use client";

import { useState } from "react";
import { useSocialStore, ProposerProfile } from "@/app/hooks/useSocialStore";
import { BRAZILIAN_STATES } from "@/app/lib/user-profiles";
import { TextInput, SelectInput, TextAreaInput } from "@/shared/components/atoms/FormControls";
import SubmitButton from "@/shared/components/atoms/SubmitButton";
import FormField from "@/shared/components/molecules/FormField";
import SavedNotice from "@/shared/components/molecules/SavedNotice";

const SAVED_NOTICE_MS = 3500;

export default function ProposerSettingsForm({ proposer }: { proposer: ProposerProfile }) {
  const { updateCurrentProposer } = useSocialStore();
  const [name, setName] = useState(proposer.name);
  const [handle, setHandle] = useState(proposer.handle);
  const [cnpj, setCnpj] = useState(proposer.cnpj);
  const [city, setCity] = useState(proposer.city);
  const [stateUf, setStateUf] = useState(proposer.state);
  const [bio, setBio] = useState(proposer.bio);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateCurrentProposer({
      name: name.trim() || proposer.name,
      handle: handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim() || "propositor"}`,
      cnpj: cnpj.replace(/\D/g, ""),
      city: city.trim(),
      state: stateUf.trim(),
      bio: bio.trim(),
    });
    setSaving(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), SAVED_NOTICE_MS);
  };

  return (
    <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
      {savedNotice && (
        <SavedNotice message="Dados do propositor atualizados no banco." href="/perfil" linkLabel="Ver perfil" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="prop-name" label="Nome da instituição">
          <TextInput id="prop-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField id="prop-handle" label="Usuário (@)">
          <TextInput id="prop-handle" type="text" value={handle} onChange={(e) => setHandle(e.target.value)} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField id="prop-cnpj" label="CNPJ">
          <TextInput
            id="prop-cnpj"
            type="text"
            className="tabular-nums"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
          />
        </FormField>
        <FormField id="prop-city" label="Cidade sede">
          <TextInput id="prop-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} />
        </FormField>
        <FormField id="prop-state" label="Estado (UF)">
          <SelectInput id="prop-state" value={stateUf} onChange={(e) => setStateUf(e.target.value)}>
            <option value="">Selecione</option>
            {BRAZILIAN_STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <FormField id="prop-bio" label="Sobre a organização propositora">
        <TextAreaInput id="prop-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
      </FormField>

      <SubmitButton saving={saving} />
    </form>
  );
}
