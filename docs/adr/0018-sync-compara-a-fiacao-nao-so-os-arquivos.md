# ADR 0018 — `kit:sync` compara a fiação dos hooks, não só os arquivos

**Status:** Aceito · 2026-10-08

## Contexto

O kit saiu da 1.0.0 com dois hooks e chegou à 1.5.0 com quatro, mais dois agentes, dois
templates e um evento de hook novo (`PreToolUse`, do ADR-0014).

A distribuição tinha um buraco que só apareceu quando o kit cresceu. Os **arquivos** de hook
são do kit (`DO_KIT`): o `sync` os sobrescreve. O `settings.json`, que **liga** esses hooks, é
do projeto — o kit entrega uma vez e nunca mais encosta, porque cada time põe ali permissões e
configurações próprias.

A consequência: um projeto instalado na 1.0.0 que rodasse `kit:sync` para a 1.5.0 receberia o
`higiene.mjs` em disco e **jamais o executaria**, porque seu `settings.json` não declara
`PreToolUse`. Nada falha, nada avisa: o arquivo está lá, atualizado, e inerte. É a mesma classe
de falha silenciosa que o ADR-0009 ataca ao derivar estado do git em vez de confiar num arquivo
escrito à mão — só que uma camada abaixo.

Havia ainda um agravante encontrado no teste: o `sync` saía antecipadamente com "Nada a
atualizar" quando os arquivos estavam idênticos, **antes** de qualquer checagem de fiação. Um
projeto com arquivos em dia e fiação velha era declarado em dia.

E o texto de autorização do `instalar` listava três eventos e um script, de quando o kit tinha
isso. Pedia autorização para menos do que passou a rodar.

## Decisão

O `sync` compara **a fiação**, não só os arquivos: lê os eventos declarados em
`settings.kit.json` (do kit) e os presentes em `settings.json` (do projeto), e reporta a
diferença. Com autorização, **acrescenta apenas os eventos ausentes** e preserva o resto do
arquivo — permissões, configurações e até um hook homônimo que o projeto já tenha customizado.

O `return` antecipado passa a considerar a fiação: só sai com "nada a atualizar" quando
arquivos **e** fiação estão em dia.

O `doctor` ganha a linha `fiação dos hooks completa` (compara os dois arquivos dentro do
próprio projeto, sem precisar da origem) e passa a imprimir a versão instalada no cabeçalho.

O texto de autorização do `instalar` passa a derivar a lista de eventos do próprio
`settings.kit.json` — não envelhece mais — e descreve **o que cada hook faz**, incluindo a
frase que faltava: o `higiene.mjs` roda antes de cada `Read` e de cada `Bash` e **pode
bloquear** uma chamada de ferramenta.

## Alternativas rejeitadas

- **Mover `settings.json` para `DO_KIT` e sobrescrever:** apagaria as permissões e
  configurações do time a cada sync. O arquivo é do projeto por um motivo.
- **Só avisar, sem oferecer a correção:** o aviso certo com o conserto manual é como a fiação
  fica velha de novo na próxima versão. O kit já pede autorização para escrever; pedir mais uma
  vez é barato.
- **Derivar o `settings.json` inteiro a cada sessão, como o estado:** o Claude Code lê esse
  arquivo antes de qualquer hook rodar. Não há de onde derivar.
- **Versionar a fiação por número** (comparar `VERSION` e aplicar migrações): mais máquina para
  o mesmo resultado. Comparar os eventos declarados responde à pergunta real — "o que o kit
  declara e este projeto não liga?" — sem depender de alguém lembrar de escrever a migração.

## Consequências

- ➕ Hook novo chega ligado, não só copiado. A falha silenciosa deixa de ser possível.
- ➕ O `doctor` responde "este projeto está completo?" sem precisar do caminho da origem.
- ➕ O texto de autorização não envelhece: a lista de eventos vem do arquivo.
- ➖ O `sync` passou a **escrever** num arquivo do projeto, o que antes não fazia. Só acrescenta
  chaves ausentes, e só com autorização — mas a fronteira "o kit não encosta no settings.json"
  deixou de ser absoluta.
- ➖ A comparação é por **nome de evento**. Se o kit mudar o *conteúdo* de um evento que o
  projeto já declara (outro matcher, outro timeout), o `sync` não percebe.
- ⚠️ Projeto que declare `PreToolUse` por conta própria conta como "ligado", e o hook do kit não
  entra. É proposital — não se sobrescreve configuração do time — mas o `doctor` vai dizer `ok`
  para uma fiação que não é a do kit.
