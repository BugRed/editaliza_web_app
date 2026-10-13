#!/usr/bin/env node
// Hook de estado do kit — núcleo do mecanismo.
//
// O que faz: deriva AGORA, do git + das specs, onde o trabalho parou, imprime
// isso como texto puro (SessionStart injeta o stdout no contexto do modelo) e
// guarda o mesmo objeto em .claude/.cache/state.json.
//
// Por que é derivado e não versionado (decisão D4): um arquivo de estado
// commitado conflita em toda branch paralela e pode mentir quando alguém
// esquece de atualizá-lo. O sistema que este kit substitui precisava de três
// estados só para detectar "estado defasado em relação ao código". Derivando,
// defasar é impossível — e o que NÃO é derivável (intenção, próximo passo,
// dívida) mora na spec da feature, que é versionada e só a branch dona toca.
//
// Decisões herdadas do hook que deu origem a este (data-engineer-lib):
// - O texto é só FATO, sem imperativo: a doc do Claude Code avisa que texto em
//   tom de comando injetado por hook pode acionar as defesas de prompt
//   injection do modelo. O que fazer com cada fato está nos comandos.
// - NUNCA falha nem bloqueia: qualquer erro vira "indeterminado" e exit 0.
// - Só `node:` + `git` (+ `gh` quando existir), zero dependências.
//
// Modos: `inicio` (SessionStart) · `checkpoint` (Stop/PreCompact) · `estado`
// (impressão manual) · `--json` (objeto cru, para script).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

// Ordem canônica de uma feature vertical neste boilerplate. É a mesma lista que
// a spec da feature carrega como checklist e que o contrato valida.
export const CAMADAS = ["prisma", "service", "controller", "route", "ui", "teste", "doc"];

const MAX_ITENS = 10;

// Orçamento de contexto por sessão (E1 / D20). O custo de uma sessão não é o
// tamanho do contexto: é a SOMA dele em cada requisição. Um resultado de N
// tokens que entra na requisição k é recobrado em todas as seguintes — o custo
// cresce com o quadrado do tamanho da sessão. Medido em 32 sessões reais deste
// usuário: 363k de contexto médio por requisição e 61% do custo só em
// releitura. O limite abaixo não é técnico (a janela comporta muito mais): é o
// ponto em que fechar e recomeçar passa a custar menos que continuar, e em que
// o context rot já degrada a resposta. Ver docs/economia-de-token.md.
const LIMITE_CONTEXTO = 200_000;

// Teto do índice de decisões injetado a cada sessão. Acima disso o hook manda o
// ponteiro em vez da lista: índice sem teto cresce até ninguém ler — é assim que
// um memory bank de markdown morre, com o texto ainda lá e já sem efeito.
// Ver ADR-0015.
export const TETO_INDICE_DECISOES = 1_200;

function escrever(texto) {
  process.stdout.write(`${texto}\n`);
}

function git(raiz, args) {
  return execFileSync("git", args, {
    cwd: raiz,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 10_000,
    // trimEnd, não trim: `git status --porcelain` começa linhas com espaço
    // (" M arquivo") e trim() comeria o da primeira.
  }).trimEnd();
}

function tentarGit(raiz, args, padrao = null) {
  try {
    return git(raiz, args);
  } catch {
    return padrao;
  }
}

function linhas(texto) {
  return (texto ?? "").split("\n").map((l) => l.trimEnd()).filter(Boolean);
}

function lerStdinJson() {
  try {
    const bruto = readFileSync(0, "utf8");
    return bruto ? JSON.parse(bruto) : {};
  } catch {
    return {};
  }
}

export function raizDoProjeto() {
  const doAmbiente = process.env.CLAUDE_PROJECT_DIR;
  if (doAmbiente && existsSync(join(doAmbiente, ".git"))) return doAmbiente;
  return tentarGit(process.cwd(), ["rev-parse", "--show-toplevel"], process.cwd());
}

// --- branch -----------------------------------------------------------------

// Padrão do boilerplate: <tipo>/<escopo>-<ID>/<slug>. Só serve para LER o que a
// branch já diz (tipo, escopo, ID, slug) — nada aqui cria nome de branch.
const PADRAO_BRANCH = /^(?<tipo>[a-z]+)\/(?<escopo>[a-z0-9]+)-(?<id>[A-Z]+\d+)\/(?<slug>.+)$/;

function lerBranch(raiz) {
  const nome = tentarGit(raiz, ["branch", "--show-current"], "") || "";
  const casado = PADRAO_BRANCH.exec(nome);
  return { nome, ...(casado ? casado.groups : {}) };
}

// A base de comparação é sempre a branch padrão do repositório. origin/main só é
// usada quando existe localmente; sem rede, `main` resolve igual.
function base(raiz) {
  for (const candidata of ["origin/main", "main", "origin/master", "master"]) {
    if (tentarGit(raiz, ["rev-parse", "--verify", "--quiet", candidata])) {
      const mb = tentarGit(raiz, ["merge-base", candidata, "HEAD"]);
      if (mb) return { ref: candidata, mergeBase: mb };
    }
  }
  return { ref: null, mergeBase: null };
}

// --- camadas ----------------------------------------------------------------

// Um caminho pertence a UMA camada. A ordem importa: um `*.test.ts` dentro de
// src/server é teste, não service — por isso teste e doc são testados antes.
function camadaDe(caminho) {
  const p = caminho.split(sep).join("/");
  if (/(^|\/)__tests__\//.test(p) || /\.(test|spec)\.tsx?$/.test(p)) return "teste";
  if (p.startsWith("docs/") || /^(CLAUDE|AGENTS|README|ROADMAP|CHANGELOG|PROGRESS|CONTRIBUTING)\.md$/.test(p)) return "doc";
  if (/^prisma\//.test(p)) return "prisma";
  if (/^src\/server\/[^/]+\/.*\.service\.ts$/.test(p)) return "service";
  if (/^src\/server\/[^/]+\/.*\.controller\.ts$/.test(p)) return "controller";
  if (p.startsWith("src/app/api/")) return "route";
  if (p.startsWith("src/shared/components/")) return "ui";
  if (p.startsWith("src/app/") && p.endsWith(".tsx")) return "ui";
  return null;
}

function camadasDe(caminhos) {
  const vistas = new Set();
  for (const c of caminhos) {
    const camada = camadaDe(c);
    if (camada) vistas.add(camada);
  }
  return CAMADAS.filter((c) => vistas.has(c));
}

function arquivosTocados(raiz, mergeBase) {
  const commitados = mergeBase ? linhas(tentarGit(raiz, ["diff", "--name-only", `${mergeBase}...HEAD`], "")) : [];
  // porcelain: "XY caminho" (e "XY antigo -> novo" em rename); o caminho começa
  // na coluna 3 e, no rename, o que interessa é o destino.
  // -uall é obrigatório: sem ele o git colapsa diretório novo inteiro numa linha
  // ("?? src/app/") e toda camada criada do zero nesta branch some do relatório.
  const pendentes = linhas(tentarGit(raiz, ["status", "--porcelain", "-uall"], "")).map((l) => {
    const caminho = l.slice(3);
    const seta = caminho.indexOf(" -> ");
    return seta === -1 ? caminho : caminho.slice(seta + 4);
  // O próprio cache não é trabalho: ele aparece como arquivo novo na primeira
  // execução e inflaria "árvore de trabalho" em todo relatório.
  }).filter((c) => !c.split(sep).join("/").startsWith(".claude/.cache/"));
  return { commitados, pendentes, todos: [...new Set([...commitados, ...pendentes])] };
}

// --- spec da feature --------------------------------------------------------

function varrerSpecs(raizFeatures) {
  if (!existsSync(raizFeatures)) return [];
  const achados = [];
  const andar = (dir) => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      const caminho = join(dir, entrada.name);
      if (entrada.isDirectory()) andar(caminho);
      else if (/^\d{4}-.+\.md$/.test(entrada.name)) achados.push(caminho);
    }
  };
  try {
    andar(raizFeatures);
  } catch {
    /* diretório ilegível: segue sem spec */
  }
  return achados;
}

function campo(texto, nome) {
  const m = new RegExp(`^\\*\\*${nome}:\\*\\*\\s*(.+)$`, "mi").exec(texto);
  return m ? m[1].trim() : null;
}

function caixas(texto, bloco) {
  // Lê um bloco delimitado por <!-- kit:<bloco> --> ... <!-- /kit:<bloco> -->.
  // Delimitador explícito para não confundir o checklist de camadas com os
  // critérios de aceite, que também são checkbox.
  const m = new RegExp(`<!--\\s*kit:${bloco}\\s*-->([\\s\\S]*?)<!--\\s*/kit:${bloco}\\s*-->`).exec(texto);
  const alvo = m ? m[1] : "";
  const marcadas = [...alvo.matchAll(/^\s*-\s*\[([ xX])\]\s*(.+)$/gm)];
  return marcadas.map(([, marca, rotulo]) => ({ feito: marca.toLowerCase() === "x", rotulo: rotulo.trim() }));
}

function acharSpec(raiz, branch) {
  const specs = varrerSpecs(join(raiz, "docs", "features"));
  for (const caminho of specs) {
    let texto = "";
    try {
      texto = readFileSync(caminho, "utf8");
    } catch {
      continue;
    }
    // Vínculo explícito primeiro: **Branch:** na spec. É o único jeito de a
    // ligação sobreviver a renomear arquivo ou mudar o slug da branch.
    if (branch.nome && campo(texto, "Branch") === branch.nome) return { caminho, texto };
  }
  // Sem vínculo explícito, tenta pelo slug — melhor que nada ao retomar uma
  // feature cuja spec ainda não registrou a branch.
  if (branch.slug) {
    for (const caminho of specs) {
      if (caminho.includes(branch.slug)) {
        try {
          return { caminho, texto: readFileSync(caminho, "utf8") };
        } catch {
          /* ignora */
        }
      }
    }
  }
  return null;
}

function lerSpec(raiz, branch) {
  const achada = acharSpec(raiz, branch);
  if (!achada) return null;
  const { caminho, texto } = achada;
  const criterios = caixas(texto, "criterios");
  return {
    caminho: relative(raiz, caminho).split(sep).join("/"),
    status: campo(texto, "Status"),
    responsabilidade: campo(texto, "Responsabilidade"),
    branch: campo(texto, "Branch"),
    proximoPasso: campo(texto, "Próximo passo") ?? campo(texto, "Proximo passo"),
    camadasMarcadas: caixas(texto, "camadas").filter((c) => c.feito).map((c) => c.rotulo.split("—")[0].trim()),
    criterios: { total: criterios.length, feitos: criterios.filter((c) => c.feito).length },
  };
}

// --- CI (opcional) ----------------------------------------------------------

// `gh` é opcional por decisão (D16): sem ele o kit funciona inteiro, só não sabe
// do CI. Nunca instala nada nem pede credencial — só pergunta e desiste.
function lerCI(raiz, branch) {
  if (!branch.nome) return { estado: "indeterminado", motivo: "sem branch" };
  const bruto = tentarGit(raiz, ["--version"]) && (() => {
    try {
      return execFileSync("gh", ["run", "list", "--branch", branch.nome, "--limit", "1", "--json", "status,conclusion,workflowName"], {
        cwd: raiz,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 8_000,
      });
    } catch {
      return null;
    }
  })();
  if (!bruto) return { estado: "indeterminado", motivo: "gh ausente ou não autenticado" };
  try {
    const [run] = JSON.parse(bruto);
    if (!run) return { estado: "sem execução", motivo: "nenhum run para esta branch" };
    return { estado: run.conclusion || run.status, workflow: run.workflowName };
  } catch {
    return { estado: "indeterminado", motivo: "resposta do gh ilegível" };
  }
}

// --- montagem ---------------------------------------------------------------

// Índice de decisões DERIVADO dos arquivos de ADR, nunca de uma lista mantida à
// mão: índice escrito à mão diverge dos arquivos e passa a mentir sem que
// ninguém perceba (mesma razão da D4). O título é o índice; o corpo se lê sob
// demanda — a disclosure em três níveis das Skills, aplicada ao histórico.
export function lerDecisoes(raiz) {
  const pasta = join(raiz, "docs", "adr");
  const vazio = { total: 0, vigentes: [], superadas: 0, semData: [], supersessaoQuebrada: [], tokens: 0 };
  let nomes;
  try {
    nomes = readdirSync(pasta).filter((n) => /^\d{4}-.*\.md$/.test(n)).sort();
  } catch {
    return vazio; // projeto sem docs/adr/: nada a dizer
  }

  const numeros = new Set(nomes.map((n) => n.slice(0, 4)));
  const resultado = { ...vazio, total: nomes.length };

  for (const nome of nomes) {
    const numero = nome.slice(0, 4);
    let texto;
    try {
      texto = readFileSync(join(pasta, nome), "utf8");
    } catch {
      continue;
    }
    const titulo = (texto.match(/^#\s*ADR\s*\d{4}\s*[—-]\s*(.+)$/m)?.[1] ?? nome).trim();
    const linhaStatus = texto.match(/^\*\*Status:\*\*\s*(.+)$/m)?.[1] ?? "";
    const data = linhaStatus.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null;
    const substituidoPor = linhaStatus.match(/ADR[\s-]*(\d{4})/i)?.[1] ?? null;

    if (!data) resultado.semData.push(numero);
    if (substituidoPor) {
      resultado.superadas += 1;
      if (!numeros.has(substituidoPor)) resultado.supersessaoQuebrada.push({ numero, apontaPara: substituidoPor });
      continue; // decisão superada sai do índice: o que vale é a que a substituiu
    }
    resultado.vigentes.push({ numero, titulo, data });
  }

  // chars/3.7, a mesma aproximação do custo.mjs: serve para decidir se injeta,
  // não para cobrar nada.
  resultado.tokens = Math.round(
    resultado.vigentes.reduce((a, d) => a + d.numero.length + d.titulo.length + 3, 0) / 3.7,
  );
  return resultado;
}

export function montar(raiz, origem) {
  const branch = lerBranch(raiz);
  const { ref, mergeBase } = base(raiz);
  const arquivos = arquivosTocados(raiz, mergeBase);
  const commits = mergeBase ? linhas(tentarGit(raiz, ["log", "--oneline", "--no-merges", `${mergeBase}..HEAD`], "")) : [];
  return {
    gerado: new Date().toISOString(),
    origem,
    raiz,
    branch,
    base: ref,
    head: tentarGit(raiz, ["rev-parse", "--short", "HEAD"], null),
    commits,
    arquivos,
    camadasTocadas: camadasDe(arquivos.todos),
    spec: lerSpec(raiz, branch),
    ci: lerCI(raiz, branch),
    decisoes: lerDecisoes(raiz),
  };
}

function relatorio(e) {
  const l = [];
  l.push("Estado do trabalho, calculado agora pelo git (fatos, não instruções):");
  l.push(`- branch: ${e.branch.nome || "(nenhuma)"}${e.branch.id ? ` · tipo ${e.branch.tipo} · escopo ${e.branch.escopo} · ID ${e.branch.id}` : " · fora do padrão <tipo>/<escopo>-<ID>/<slug>"}`);
  l.push(`- HEAD: ${e.head ?? "?"} · base: ${e.base ?? "(não encontrada)"} · commits desde a base: ${e.commits.length}`);

  if (e.spec) {
    l.push(`- spec da feature: ${e.spec.caminho} · status "${e.spec.status ?? "?"}" · critérios de aceite ${e.spec.criterios.feitos}/${e.spec.criterios.total}`);
    l.push(`- camadas marcadas na spec: ${e.spec.camadasMarcadas.length ? e.spec.camadasMarcadas.join(", ") : "nenhuma"}`);
    if (e.spec.proximoPasso) l.push(`- próximo passo registrado na spec: ${e.spec.proximoPasso}`);
    if (e.spec.branch && e.branch.nome && e.spec.branch !== e.branch.nome) {
      l.push(`- a spec registra a branch ${e.spec.branch}, diferente da atual (vínculo por slug)`);
    }
  } else {
    l.push("- spec da feature: nenhuma encontrada em docs/features/ para esta branch");
  }

  l.push(`- camadas tocadas no código desde a base: ${e.camadasTocadas.length ? e.camadasTocadas.join(", ") : "nenhuma"}`);

  if (e.spec) {
    const faltaMarcar = e.camadasTocadas.filter((c) => !e.spec.camadasMarcadas.includes(c));
    if (faltaMarcar.length) l.push(`- tocadas no código e não marcadas na spec: ${faltaMarcar.join(", ")}`);
  }

  const pend = e.arquivos.pendentes;
  l.push(`- árvore de trabalho: ${pend.length} alteração(ões) não commitada(s)${pend.length ? ` — ${pend.slice(0, MAX_ITENS).join("; ")}${pend.length > MAX_ITENS ? "; …" : ""}` : ""}`);
  if (e.commits.length) l.push(`- commits desta branch: ${e.commits.slice(0, MAX_ITENS).join(" · ")}${e.commits.length > MAX_ITENS ? " · …" : ""}`);
  l.push(`- CI: ${e.ci.estado}${e.ci.workflow ? ` (${e.ci.workflow})` : ""}${e.ci.motivo ? ` — ${e.ci.motivo}` : ""}`);
  if (e.decisoes?.total) {
    const d = e.decisoes;
    const extra = d.superadas ? ` (+${d.superadas} superada${d.superadas > 1 ? "s" : ""})` : "";
    if (d.tokens <= TETO_INDICE_DECISOES) {
      l.push(
        `- decisões vigentes em docs/adr/${extra}, corpo sob demanda: ` +
          d.vigentes.map((x) => `${x.numero} ${x.titulo}`).join(" · "),
      );
    } else {
      l.push(
        `- decisões: ${d.vigentes.length} vigentes em docs/adr/${extra} — índice acima do teto de ` +
          `${TETO_INDICE_DECISOES} tokens; leia a pasta quando a tarefa tocar uma decisão`,
      );
    }
  }
  l.push(`- checkpoint: ${e.checkpoint ? `${e.checkpoint.quando} — ${e.checkpoint.resumo}` : "nenhum nesta máquina"}`);
  return l.join("\n");
}

// --- cache ------------------------------------------------------------------

function caminhoCache(raiz) {
  return join(raiz, ".claude", ".cache", "state.json");
}

function lerCache(raiz) {
  try {
    return JSON.parse(readFileSync(caminhoCache(raiz), "utf8"));
  } catch {
    return null;
  }
}

function salvarCache(raiz, estado) {
  try {
    const caminho = caminhoCache(raiz);
    mkdirSync(dirname(caminho), { recursive: true });
    writeFileSync(caminho, `${JSON.stringify(estado, null, 2)}\n`, "utf8");
  } catch {
    /* cache é conveniência; não poder gravar não pode quebrar a sessão */
  }
}

// O checkpoint (Stop/PreCompact) é LOCAL por desenho: gravar prosa na spec a
// cada parada encheria o diff de ruído. O que atravessa máquina é a spec, que o
// /fechar atualiza. Aqui só se guarda o suficiente para retomar depois de um
// /clear ou de uma sessão morta na mesma máquina.
function linhasDaTranscricao(entrada) {
  const caminho = entrada?.transcript_path;
  if (!caminho || !existsSync(caminho)) return null;
  try {
    return readFileSync(caminho, "utf8").split("\n").filter(Boolean);
  } catch {
    return null; // sem permissão ou formato mudou: segue sem transcrição
  }
}

// Lê uma vez, serve os dois usos (resumo e orçamento): a transcrição de uma
// sessão longa passa de 1 MB e este hook roda a cada parada.
function resumoDaTranscricao(linhasArquivo) {
  if (!linhasArquivo) return null;
  try {
    for (let i = linhasArquivo.length - 1; i >= 0; i -= 1) {
      const evento = JSON.parse(linhasArquivo[i]);
      const conteudo = evento?.message?.content;
      if (evento?.message?.role !== "assistant" || !Array.isArray(conteudo)) continue;
      const texto = conteudo.filter((b) => b?.type === "text").map((b) => b.text).join(" ").trim();
      if (texto) return texto.replace(/\s+/g, " ").slice(0, 300);
    }
  } catch {
    /* formato de transcrição mudou: segue sem resumo */
  }
  return null;
}

// O que foi cobrado como ENTRADA em cada requisição é o contexto inteiro
// daquele momento — lido do cache ou gravado nele. Requisição de subagente
// (isSidechain) roda em janela própria e não pesa na thread principal, então
// não conta aqui.
function orcamentoDaTranscricao(linhasArquivo) {
  if (!linhasArquivo) return null;
  let atual = 0;
  let pico = 0;
  let requisicoes = 0;
  for (const linha of linhasArquivo) {
    let evento;
    try {
      evento = JSON.parse(linha);
    } catch {
      continue;
    }
    if (evento?.isSidechain === true) continue;
    const uso = evento?.message?.usage;
    if (!uso) continue;
    const contexto =
      (uso.cache_read_input_tokens ?? 0) + (uso.cache_creation_input_tokens ?? 0) + (uso.input_tokens ?? 0);
    // A transcrição guarda eventos de `usage` com tudo zerado (12 em 4.037 numa
    // sessão real) — são marcadores, não requisições: nenhuma releitura de
    // contexto aconteceu. Contá-los faria a última parada reportar "0 tokens".
    if (contexto === 0) continue;
    requisicoes += 1;
    atual = contexto;
    if (contexto > pico) pico = contexto;
  }
  return requisicoes ? { atual, pico, requisicoes } : null;
}

function mil(n) {
  return n.toLocaleString("pt-BR");
}

// Avisa UMA vez por sessão, ao cruzar o limite. Alarme repetido a cada parada
// vira ruído e para de ser lido — que é exatamente como um memory bank de
// markdown morre.
function avisoDeOrcamento(estado, linhasArquivo, entrada, anterior) {
  const uso = orcamentoDaTranscricao(linhasArquivo);
  if (!uso) return null;

  const sessao = entrada?.session_id ?? null;
  estado.orcamento = { sessao, atual: uso.atual, pico: uso.pico, requisicoes: uso.requisicoes };

  const avisoAnterior = anterior?.orcamento;
  if (avisoAnterior?.avisadoEm && avisoAnterior.sessao === sessao) {
    estado.orcamento.avisadoEm = avisoAnterior.avisadoEm; // já avisou nesta sessão
    return null;
  }
  if (uso.pico <= LIMITE_CONTEXTO) return null;

  estado.orcamento.avisadoEm = new Date().toISOString();
  return (
    `Orçamento de contexto estourado: ${mil(uso.atual)} tokens na última requisição ` +
    `(limite ${mil(LIMITE_CONTEXTO)}), em ${uso.requisicoes} requisições nesta sessão. ` +
    "Cada resultado novo volta em todas as requisições seguintes, então daqui em diante " +
    "continuar custa mais que recomeçar — e o contexto longo também piora a resposta. " +
    "O checkpoint já está gravado: /fechar e depois /clear retomam sem perder o fio."
  );
}

function principal() {
  const modo = process.argv[2] ?? "estado";
  const comoJson = process.argv.includes("--json");
  const raiz = raizDoProjeto();
  const entrada = modo === "inicio" || modo === "checkpoint" ? lerStdinJson() : {};

  let estado;
  try {
    estado = montar(raiz, entrada?.source ?? modo);
  } catch (erro) {
    if (comoJson) escrever(JSON.stringify({ estado: "indeterminado", motivo: String(erro?.message ?? erro) }));
    else escrever(`Estado indeterminado (${erro?.message ?? erro}). Nenhuma conclusão sobre o trabalho anterior pode ser tirada deste relatório.`);
    return;
  }

  const anterior = lerCache(raiz);
  estado.checkpoint = anterior?.checkpoint ?? null;
  estado.orcamento = anterior?.orcamento ?? null;

  if (modo === "checkpoint") {
    const linhasArquivo = linhasDaTranscricao(entrada);
    const resumo = resumoDaTranscricao(linhasArquivo);
    estado.checkpoint = {
      quando: new Date().toISOString(),
      branch: estado.branch.nome,
      camadasTocadas: estado.camadasTocadas,
      pendentes: estado.arquivos.pendentes.length,
      resumo: resumo ?? "(sem resumo da transcrição)",
    };
    const aviso = avisoDeOrcamento(estado, linhasArquivo, entrada, anterior);
    salvarCache(raiz, estado);

    // Stop/PreCompact não injetam contexto: um relatório aqui seria custo puro.
    // O aviso de orçamento sai por `systemMessage`, que o Claude Code mostra ao
    // USUÁRIO sem gastar um token de contexto — quem decide fechar é ele. É
    // também por isso que o texto é imperativo: a regra de "só fato, sem
    // imperativo" protege o contexto do MODELO, e não vale para o usuário.
    if (aviso) escrever(JSON.stringify({ systemMessage: aviso }));
    return;
  }

  salvarCache(raiz, estado);
  escrever(comoJson ? JSON.stringify(estado, null, 2) : relatorio(estado));
}

// Importado por contrato.mjs: só executa quando É o arquivo chamado na linha de
// comando, nunca como efeito colateral do import.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) principal();
