# ADR 0009 — Estado de sessão derivado do git, nunca versionado

**Status:** Aceito · 2026-10-08

## Contexto

Uma sessão de IA começa sem memória: sem um registro do que já foi feito, ela reconstrói o
contexto lendo código, `git log` e documentação — caro em token e impreciso. A prática
conhecida é manter um `PROGRESS.md` versionado com o estado do trabalho (branch, SHA, baseline
de teste, próxima tarefa).

Essa prática tem dois defeitos que só aparecem com o uso. **Primeiro:** o arquivo repete o que
o git já sabe, então envelhece — uma sessão que termina sem atualizá-lo deixa o estado
mentindo, e passa a ser preciso um mecanismo só para detectar essa defasagem (num projeto
irmão, três estados distintos de "defasado"). **Segundo:** é o arquivo que toda branch toca em
toda sessão, então conflita em merge assim que mais de uma pessoa ou agente trabalha em
paralelo — e o boilerplate existe justamente para times.

Opções consideradas: (a) versionar o estado e conviver com a defasagem; (b) um arquivo de
estado por feature, versionado; (c) derivar o estado do git a cada sessão.

## Decisão

Usaremos estado **derivado**. O hook `.claude/hooks/estado.mjs` calcula, a cada
`SessionStart`, o que o git e as specs já dizem — branch, tipo/escopo/ID, commits desde a
base, arquivos tocados, camadas da arquitetura atingidas, status da spec, CI quando o `gh`
existir — e guarda em `.claude/.cache/state.json`, que está no `.gitignore`.

O que **não** é derivável — intenção, próximo passo, dívida, decisão em aberto — mora na spec
da feature (ADR-0010), que é versionada e tocada só pela branch dona dela.

Nenhum arquivo versionado repete SHA, branch, cobertura ou baseline de teste.

## Consequências

- ➕ Defasagem deixa de ser possível: não há segunda versão da verdade para envelhecer.
- ➕ Zero conflito de merge no estado, com qualquer número de branches em paralelo.
- ➕ A sessão começa com os fatos já no contexto, sem gastar chamadas para redescobri-los.
- ➖ Quem não roda o hook (outra ferramenta, revisor no GitHub) não enxerga o estado; precisa
  rodar `node .claude/hooks/estado.mjs estado`.
- ➖ O cache é por máquina: o checkpoint de uma sessão interrompida não viaja para outro
  computador. O que precisa viajar tem que estar na spec.
- ⚠️ Se algum dia o estado precisar ser lido por um serviço externo (dashboard, bot de PR),
  esta decisão será o gargalo — revisitar com um ADR novo, não contornando com commit de bot.
