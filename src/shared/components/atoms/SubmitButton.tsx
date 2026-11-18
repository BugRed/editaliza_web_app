interface SubmitButtonProps {
  saving: boolean;
  className?: string;
  label?: string;
}

export default function SubmitButton({ saving, className = "", label = "Salvar alterações" }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={saving}
      className={`px-6 py-2.5 rounded-xl bg-(--primary) text-white text-sm font-bold hover:bg-(--primary-hover) disabled:opacity-60 transition-colors cursor-pointer ${className}`.trim()}
    >
      {saving ? "Salvando..." : label}
    </button>
  );
}
