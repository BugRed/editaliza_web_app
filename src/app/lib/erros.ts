// Mensagem de erro segura para UI: erro desconhecido não vira "undefined" na tela
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message;
  return String(erro);
}
