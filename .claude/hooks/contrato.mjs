#!/usr/bin/env node
// Validação do contrato de estado (decisão D14).
//
// Roda local: chamado pelo /fechar e repetido no `pre-push` do husky. Não
// depende de `gh`, de PR aberto nem de minuto de GitHub Actions — falha antes
// do commit sair da máquina.
//
// O que ele garante é o que nenhuma ferramenta do boilerplate garante: que o
// ESTADO escrito bate com o CÓDIGO entregue. Prettier, ESLint, tsc e Vitest
// olham o código; este arquivo olha a distância entre o código e a spec.
//
// Saída: texto amigável com o próximo passo, ou --json (objeto único, stdout
// 100% parseável, exit 1 quando há erro).

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";

import { TETO_INDICE_DECISOES, montar, raizDoProjeto } from "./estado.mjs";

const TIPOS_QUE_EXIGEM_SPEC = new Set(["feature", "release"]);

function achados(estado, raiz) {
  const erros = [];
  const avisos = [];
  const spec = estado.spec;
  const entregue = (spec?.status ?? "").toLowerCase() === "entregue";
  const tipo = estado.branch.tipo;

  // 1. Feature sem spec: o próximo /feature não tem de onde retomar, e a
  //    revisão não tem contra o que comparar.
  if (TIPOS_QUE_EXIGEM_SPEC.has(tipo) && !spec) {
    erros.push({
      regra: "spec-ausente",
      mensagem: `A branch é do tipo "${tipo}" e nenhuma spec em docs/features/ aponta para ela.`,
      proximoPasso: "Crie a spec a partir de docs/features/TEMPLATE.md e preencha **Branch:** com o nome desta branch.",
    });
  }

  if (spec && !spec.branch) {
    avisos.push({
      regra: "spec-sem-vinculo",
      mensagem: `${spec.caminho} foi encontrada pelo slug, não pelo campo **Branch:**.`,
      proximoPasso: "Preencha **Branch:** na spec — o vínculo por slug quebra se o arquivo for renomeado.",
    });
  }

  // 2. Camada tocada no código e não marcada na spec. Aviso durante o trabalho
  //    (é normal estar no meio), erro quando a spec se declara entregue.
  if (spec) {
    const faltando = estado.camadasTocadas.filter((c) => !spec.camadasMarcadas.includes(c));
    if (faltando.length) {
      const item = {
        regra: "camada-nao-marcada",
        mensagem: `Camadas tocadas no código e não marcadas na spec: ${faltando.join(", ")}.`,
        proximoPasso: `Marque as camadas em ${spec.caminho} (bloco kit:camadas) ou explique na spec por que não valem.`,
      };
      (entregue ? erros : avisos).push(item);
    }
  }

  // 3. "Entregue" sem teste. É a regra que D13 pede explicitamente: o estado
  //    vira contrato verificável em vez de boa intenção.
  if (entregue && spec && !spec.camadasMarcadas.includes("teste")) {
    erros.push({
      regra: "entregue-sem-teste",
      mensagem: 'A spec está marcada como "entregue" com a camada teste desmarcada.',
      proximoPasso: "Escreva o teste das camadas tocadas (yarn test:cov) ou volte o status para em-desenvolvimento.",
    });
  }

  // 4. "Entregue" com critério de aceite em aberto.
  if (entregue && spec && spec.criterios.total > 0 && spec.criterios.feitos < spec.criterios.total) {
    erros.push({
      regra: "entregue-com-criterio-aberto",
      mensagem: `A spec está "entregue" com ${spec.criterios.total - spec.criterios.feitos} critério(s) de aceite não marcado(s).`,
      proximoPasso: "Marque os critérios cumpridos ou mova os que ficaram para uma próxima feature.",
    });
  }

  // 5. Regra de negócio sem documentação. O boilerplate declara *.service.ts
  //    como a camada que carrega regra de negócio; docs/negocio/ é o lar dela.
  const tocouService = estado.arquivos.todos.some((c) => /^src\/server\/[^/]+\/.*\.service\.ts$/.test(c.split(sep).join("/")));
  const tocouNegocio = estado.arquivos.todos.some((c) => c.split(sep).join("/").startsWith("docs/negocio/"));
  if (tocouService && !tocouNegocio) {
    const item = {
      regra: "negocio-sem-doc",
      mensagem: "Um *.service.ts mudou nesta branch e nenhum arquivo de docs/negocio/ foi tocado.",
      proximoPasso: "Se a mudança decide ou altera comportamento de negócio, registre em docs/negocio/ (skill documentar-regra-negocio). Se é só técnica, ignore este aviso.",
    };
    (entregue ? erros : avisos).push(item);
  }

  // 6. Sem próximo passo em feature no meio do caminho: a próxima sessão perde
  //    a intenção, que é justamente o que o git não guarda.
  if (spec && !entregue && !spec.proximoPasso) {
    avisos.push({
      regra: "sem-proximo-passo",
      mensagem: `${spec.caminho} não tem **Próximo passo:** preenchido.`,
      proximoPasso: "Escreva uma linha dizendo o que falta — é o que a próxima sessão lê primeiro.",
    });
  }

  // 7. Dívida declarada na spec e ausente do registro global.
  if (existsSync(join(raiz, "docs", "divida.md")) && spec) {
    try {
      const texto = readFileSync(join(raiz, spec.caminho), "utf8");
      const temDivida = /##\s*D[íi]vida[\s\S]*?\n-\s+\S/.test(texto);
      const noGlobal = readFileSync(join(raiz, "docs", "divida.md"), "utf8").includes(spec.caminho);
      if (entregue && temDivida && !noGlobal) {
        avisos.push({
          regra: "divida-so-na-spec",
          mensagem: "A spec declara dívida e docs/divida.md não cita esta feature.",
          proximoPasso: "Leve a dívida para docs/divida.md — dívida que mora só na spec de uma feature fechada some de vista.",
        });
      }
    } catch {
      /* spec ilegível já foi reportada em outro ponto */
    }
  }

  // 8. Saúde do registro de decisões. O índice é derivado dos arquivos, então
  //    não pode divergir — mas o CONTEÚDO ainda pode apodrecer: supersessão
  //    apontando para ADR que não existe é referência zumbi, e decisão sem data
  //    não ordena (supersessão sem tempo não diz qual veio depois).
  const decisoes = estado.decisoes;
  if (decisoes?.total) {
    for (const quebrada of decisoes.supersessaoQuebrada) {
      erros.push({
        regra: "supersessao-quebrada",
        mensagem: `ADR-${quebrada.numero} diz ter sido substituído por ADR-${quebrada.apontaPara}, que não existe em docs/adr/.`,
        proximoPasso: `Corrija o Status do ADR-${quebrada.numero} para o número certo, ou escreva o ADR-${quebrada.apontaPara} que falta.`,
      });
    }
    if (decisoes.semData.length) {
      avisos.push({
        regra: "decisao-sem-data",
        mensagem: `ADR sem data no Status: ${decisoes.semData.join(", ")}.`,
        proximoPasso: "Acrescente a data na linha **Status:** (ex.: `**Status:** Aceito · 2026-10-08`) — sem ela não dá para saber qual decisão veio depois.",
      });
    }
    if (decisoes.tokens > TETO_INDICE_DECISOES) {
      avisos.push({
        regra: "indice-de-decisoes-acima-do-teto",
        mensagem: `O índice de decisões tem ~${decisoes.tokens} tokens, acima do teto de ${TETO_INDICE_DECISOES}: o hook passou a mandar só o ponteiro.`,
        proximoPasso: "Pode: marque como superados os ADRs que já não valem (Status `Substituído por ADR-NNNN`) — decisão superada sai do índice sem perder a história.",
      });
    }
  }

  return { erros, avisos };
}

function principal() {
  const comoJson = process.argv.includes("--json");
  const raiz = raizDoProjeto();
  let estado;
  try {
    estado = montar(raiz, "contrato");
  } catch (erro) {
    const msg = `Não foi possível calcular o estado (${erro?.message ?? erro}).`;
    if (comoJson) process.stdout.write(`${JSON.stringify({ status: "erro", mensagem: msg, erros: [], avisos: [] })}\n`);
    else process.stdout.write(`${msg}\nPróximo passo: rode dentro do repositório, com git disponível.\n`);
    process.exit(1);
  }

  const { erros, avisos } = achados(estado, raiz);
  const status = erros.length ? "reprovado" : "aprovado";

  if (comoJson) {
    process.stdout.write(`${JSON.stringify({ status, branch: estado.branch.nome, spec: estado.spec?.caminho ?? null, erros, avisos }, null, 2)}\n`);
    process.exit(erros.length ? 1 : 0);
  }

  const linhas = [];
  for (const e of erros) linhas.push(`ERRO  [${e.regra}] ${e.mensagem}\n      → ${e.proximoPasso}`);
  for (const a of avisos) linhas.push(`aviso [${a.regra}] ${a.mensagem}\n      → ${a.proximoPasso}`);
  if (!linhas.length) linhas.push("Contrato de estado: nada a corrigir.");
  else linhas.unshift(`Contrato de estado — ${erros.length} erro(s), ${avisos.length} aviso(s):`);
  process.stdout.write(`${linhas.join("\n")}\n`);
  process.exit(erros.length ? 1 : 0);
}

principal();
