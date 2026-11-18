export interface SearchableUser {
  name: string;
  handle: string;
  tags: string[];
  city: string;
  state: string;
}

/** Filtra por nome, @usuário, linguagem, cidade ou UF, sem diferenciar maiúsculas. Busca vazia devolve todos. */
export function filterUsers<T extends SearchableUser>(users: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return users;
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(q) ||
      user.handle.toLowerCase().includes(q) ||
      user.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      user.city.toLowerCase().includes(q) ||
      user.state.toLowerCase().includes(q)
  );
}
