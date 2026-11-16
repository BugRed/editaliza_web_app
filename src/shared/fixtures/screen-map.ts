export type ScreenEntry = { number: number; name: string; href: string; role: string; wave: string; states: { label: string; href: string }[] };

// Espelha a tabela de docs/ui/mapa-de-telas.md §2 (rotas reais ficam fora: login e cadastro).
export const SCREENS: ScreenEntry[] = [
  { number: 3, name: "Feed", href: "/prototipo/feed", role: "artista", wave: "O3", states: [{ label: "vazio", href: "/prototipo/feed?estado=vazio" }, { label: "carregando", href: "/prototipo/feed?estado=carregando" }] },
  { number: 4, name: "Detalhe do edital", href: "/prototipo/editais/1", role: "artista", wave: "O3", states: [{ label: "encerrado, sem resumo", href: "/prototipo/editais/2" }] },
  { number: 5, name: "Salvos", href: "/prototipo/salvos", role: "artista", wave: "O3", states: [{ label: "vazio", href: "/prototipo/salvos?estado=vazio" }] },
  { number: 6, name: "Perfil e privacidade", href: "/prototipo/perfil", role: "artista", wave: "O2", states: [] },
  { number: 7, name: "Admin: edital", href: "/prototipo/admin/editais", role: "admin", wave: "O3", states: [] },
  { number: 8, name: "Onboarding", href: "/prototipo/onboarding", role: "artista", wave: "O4", states: [] },
  { number: 9, name: "Trajetória", href: "/prototipo/perfil/trajetoria", role: "artista", wave: "O4", states: [{ label: "vazio", href: "/prototipo/perfil/trajetoria?estado=vazio" }] },
  { number: 10, name: "Obras", href: "/prototipo/perfil/obras", role: "artista", wave: "O4", states: [{ label: "vazio", href: "/prototipo/perfil/obras?estado=vazio" }] },
  { number: 11, name: "Por quê", href: "/prototipo/editais/1/porque", role: "artista", wave: "O4", states: [] },
  { number: 12, name: "Perfil público do artista", href: "/prototipo/artistas/1", role: "autenticado", wave: "O4", states: [] },
  { number: 13, name: "Organização: publicar edital", href: "/prototipo/organizacao/editais/novo", role: "organização", wave: "O5", states: [] },
  { number: 14, name: "Organização: candidatos", href: "/prototipo/organizacao/editais/1/candidatos", role: "organização", wave: "O5", states: [{ label: "vazio", href: "/prototipo/organizacao/editais/1/candidatos?estado=vazio" }] },
];
