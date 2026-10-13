#!/usr/bin/env node
// Hook de higiene de contexto (PreToolUse) — ADR-0014.
//
// Por que existe: 75% do conteúdo das sessões medidas é resultado de
// ferramenta, e o custo não é pagá-lo uma vez. Um resultado de N tokens que
// entra na requisição k é recobrado em TODAS as seguintes — o custo de uma
// sessão é a soma do contexto em cada requisição, não o pico. Em 32 sessões
// reais, oito leituras de arquivo inteiro somaram ~690 mil tokens; a maior
// despejou ~165 mil numa chamada só.
//
// O que faz: recusa a leitura de arquivo grande SEM recorte e diz o que fazer
// no lugar. Não é trava de segurança, é redirecionamento — a recusa chega ao
// modelo como texto (`permissionDecisionReason`) e ele refaz sozinho com
// `grep` + `offset/limit`. O custo da recusa é ~100 tokens; o que ela evita são
// ~10 mil.
//
// Cobre `Read` e `Bash` pelo mesmo critério de propósito: `cat arquivo` é uma
// leitura de arquivo inteiro com outro nome, e guardar só o `Read` deixaria a
// porta aberta — ainda mais onde a configuração da sessão prefere `cat`.
//
// NUNCA quebra a sessão: qualquer erro interno sai com exit 0 e sem decisão,
// deixando o fluxo normal de permissão seguir.

import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, isAbsolute, resolve } from "node:path";

// ~10 mil tokens: 5% do orçamento de contexto (ADR-0013) numa única chamada.
// Calibrado contra a distribuição real de um projeto Next grande: p50 = 4 KB,
// p90 = 56 KB. Pega a cauda sem atrapalhar o caso comum.
const LIMITE_BYTES = Number(process.env.KIT_LIMITE_LEITURA ?? 40_000);

// Lidos por outro caminho (pixels, páginas), onde tamanho em bytes não diz nada
// sobre o custo em contexto.
const SEM_MEDIDA_EM_BYTES = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".ico",
  ".pdf", ".ipynb",
]);

// Se a saída já vai ser cortada adiante, o contexto não corre risco.
const LIMITADORES = /\|\s*(head|tail|grep|rg|wc|sed|awk|jq|cut|sort|uniq|less|more|column|tr|python3?|node)\b/;

// `cat > arquivo`, `cat >> arquivo` e heredoc são ESCRITA, não leitura.
const ESCRITA = /(^|[^<>|&])>>?\s|<<[-']?\w/;

const COMANDOS_QUE_DESPEJAM = /(^|[;&|]\s*)(cat|bat|less|more)\s+([^\n;|&]+)/g;

function kb(n) {
  return `${Math.round(n / 1024)} KB`;
}

function tokens(n) {
  return `~${Math.round(n / 3.7 / 1000)} mil tokens`;
}

function grande(caminho, cwd) {
  if (!caminho || caminho.startsWith("-")) return null;
  if (SEM_MEDIDA_EM_BYTES.has(extname(caminho).toLowerCase())) return null;
  const absoluto = isAbsolute(caminho) ? caminho : resolve(cwd || process.cwd(), caminho);
  try {
    if (!existsSync(absoluto)) return null;
    const info = statSync(absoluto);
    if (!info.isFile() || info.size <= LIMITE_BYTES) return null;
    return { caminho: absoluto, bytes: info.size };
  } catch {
    return null;
  }
}

function recusar(motivo) {
  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: motivo,
      },
    })}\n`,
  );
  process.exit(0);
}

function analisarRead(entrada, cwd) {
  const { file_path: caminho, offset, limit } = entrada.tool_input ?? {};
  if (offset !== undefined || limit !== undefined) return; // já é fatia
  const achado = grande(caminho, cwd);
  if (!achado) return;
  recusar(
    `Leitura de arquivo inteiro recusada: ${caminho} tem ${kb(achado.bytes)} (${tokens(achado.bytes)}). ` +
      "Isso entraria no contexto e seria recobrado em todas as requisições seguintes desta sessão. " +
      "Localize primeiro (Grep pelo símbolo ou pelo trecho) e depois leia só a faixa, com `offset` e " +
      "`limit` no Read. Se precisar mesmo do arquivo todo, leia em partes e diga por quê.",
  );
}

function analisarBash(entrada, cwd) {
  const comando = entrada.tool_input?.command ?? "";
  if (!comando || LIMITADORES.test(comando) || ESCRITA.test(comando)) return;
  for (const achadoRegex of comando.matchAll(COMANDOS_QUE_DESPEJAM)) {
    const argumentos = achadoRegex[3].trim().split(/\s+/);
    for (const argumento of argumentos) {
      const achado = grande(argumento.replace(/^["']|["']$/g, ""), cwd);
      if (!achado) continue;
      recusar(
        `\`${achadoRegex[2]}\` de arquivo inteiro recusado: ${argumento} tem ${kb(achado.bytes)} ` +
          `(${tokens(achado.bytes)}), e o resultado volta em todas as requisições seguintes. ` +
          "Use `grep -n` para achar a linha e `sed -n 'inicio,fimp'` para ler só a faixa — ou " +
          "mande a saída para um arquivo e leia fatias dele.",
      );
    }
  }
}

function principal() {
  let entrada;
  try {
    const bruto = readFileSync(0, "utf8");
    entrada = bruto ? JSON.parse(bruto) : null;
  } catch {
    return; // sem stdin legível: nenhuma decisão, fluxo normal segue
  }
  if (!entrada) return;
  const cwd = entrada.cwd || process.cwd();
  try {
    if (entrada.tool_name === "Read") analisarRead(entrada, cwd);
    else if (entrada.tool_name === "Bash") analisarBash(entrada, cwd);
  } catch {
    /* um hook de higiene nunca pode derrubar a sessão que protege */
  }
}

principal();
