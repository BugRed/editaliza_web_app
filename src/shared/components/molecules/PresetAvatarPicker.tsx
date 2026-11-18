interface PresetAvatarPickerProps {
  value: string;
  presets: string[];
  onChange: (url: string) => void;
}

export default function PresetAvatarPicker({ value, presets, onChange }: PresetAvatarPickerProps) {
  return (
    <div className="space-y-2.5">
      <p className="block text-sm font-bold text-(--foreground)">Foto do perfil</p>
      <div className="flex flex-wrap items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Prévia do avatar"
          className="w-16 h-16 rounded-full object-cover border-2 border-(--primary-fg)"
        />
        <div className="flex items-center gap-2">
          {presets.map((preset, i) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`rounded-full p-0.5 border-2 cursor-pointer transition-colors ${
                value === preset
                  ? "border-(--accent)"
                  : "border-transparent hover:border-(--border-subtle)"
              }`}
              title={`Selecionar foto ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preset}
                alt={`Opção ${i + 1}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
