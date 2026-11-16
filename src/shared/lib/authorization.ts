// Regras de quem pode fazer o quê. Puras de propósito: a leitura da sessão fica em app/lib/session.ts
// e estas funções só decidem, então dá para testar sem banco nem requisição.
export type ProfileKind = "ARTIST" | "PROPOSER";

export interface SessionUserLike {
  id: number | string;
  userType?: string | null;
}

function normalizeType(userType: string | null | undefined): string {
  return String(userType ?? "ARTIST").toUpperCase();
}

/** Só o dono edita o próprio perfil, e só na tabela do seu tipo (artista não edita proponente com o mesmo id). */
export function canEditProfile(user: SessionUserLike | null, targetId: number, kind: ProfileKind): boolean {
  if (!user) return false;
  return Number(user.id) === targetId && normalizeType(user.userType) === kind;
}

/** O dono de um edital precisa ser PROPOSER (regra já escrita no modelo `Edital`). */
export function canPublishEdital(user: SessionUserLike | null): boolean {
  return user !== null && normalizeType(user.userType) === "PROPOSER";
}
