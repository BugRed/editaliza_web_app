import { TextInput, SelectInput } from "@/shared/components/atoms/FormControls";
import CheckboxField from "@/shared/components/molecules/CheckboxField";
import FormField from "@/shared/components/molecules/FormField";
import LanguageGroupPicker from "@/shared/components/molecules/LanguageGroupPicker";
import { ProfileLevel, TerritoryScope } from "@/shared/lib/artistrank";

export interface SignupArtistValues {
  territoryScope: TerritoryScope;
  profileLevel: ProfileLevel;
  experienceYears: number;
  coreLanguages: string[];
  hasCnpjOrMei: boolean;
  hasTechnicalFormation: boolean;
}

interface SignupArtistFieldsProps {
  values: SignupArtistValues;
  onChange: (patch: Partial<SignupArtistValues>) => void;
}

export default function SignupArtistFields({ values, onChange }: SignupArtistFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField id="cad-scope" label="Atuação">
          <SelectInput
            id="cad-scope"
            value={values.territoryScope}
            onChange={(e) => onChange({ territoryScope: e.target.value as TerritoryScope })}
          >
            <option value="MUNICIPAL">Municipal</option>
            <option value="METROPOLITANO">Metropolitano</option>
            <option value="ESTADUAL">Estadual</option>
            <option value="NACIONAL">Nacional</option>
          </SelectInput>
        </FormField>
        <FormField id="cad-level" label="Momento">
          <SelectInput
            id="cad-level"
            value={values.profileLevel}
            onChange={(e) => onChange({ profileLevel: e.target.value as ProfileLevel })}
          >
            <option value="INICIANTE">Iniciante</option>
            <option value="EMERGENTE">Emergente</option>
            <option value="CONSOLIDADO">Consolidado</option>
            <option value="MESTRE">Mestre</option>
          </SelectInput>
        </FormField>
        <FormField id="cad-exp" label="Anos de prática">
          <TextInput
            id="cad-exp"
            type="number"
            min={0}
            max={70}
            className="tabular-nums"
            value={values.experienceYears}
            onChange={(e) => onChange({ experienceYears: Number(e.target.value) })}
          />
        </FormField>
      </div>

      <LanguageGroupPicker
        selected={values.coreLanguages}
        onChange={(coreLanguages) => onChange({ coreLanguages })}
      />

      <div className="flex flex-wrap gap-5 pt-1">
        <CheckboxField
          label="Possuo CNPJ ou MEI cultural"
          checked={values.hasCnpjOrMei}
          onChange={(hasCnpjOrMei) => onChange({ hasCnpjOrMei })}
        />
        <CheckboxField
          label="Possuo formação técnica"
          checked={values.hasTechnicalFormation}
          onChange={(hasTechnicalFormation) => onChange({ hasTechnicalFormation })}
        />
      </div>
    </>
  );
}
