// utils/SafeDate.tsx
export function SafeDate(date?: Date | null): string {
  if (!date) {
    return "Data indisponível";
  }

  try {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Data inválida";
  }
}
