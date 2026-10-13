#!/usr/bin/env node
/**
 * custo.mjs — mede o gasto REAL de token das sessões do Claude Code.
 *
 * Por que existe: o tamanho dos .md é a parte visível e quase irrelevante do gasto.
 * O que domina é o contexto RELIDO a cada requisição (cache read), que cresce de forma
 * quadrática com o tamanho da sessão: um resultado de ferramenta de N tokens inserido na
 * requisição k é recobrado em todas as requisições seguintes. Este script lê os transcripts
 * (~/.claude/projects/<slug>/*.jsonl), que trazem o `usage` exato cobrado por requisição,
 * e aponta os três vilões mensuráveis: sessão longa, resultado-monstro e screenshot.
 *
 * Uso:  node kit/scripts/custo.mjs [--todos] [--json] [--limite-ctx 200000]
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const valor = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? Number(args[i + 1]) : d; };
const JSON_OUT = flag('--json');
const LIMITE_CTX = valor('--limite-ctx', 200_000);   // contexto por requisição aceitável
const LIMITE_RESULTADO = valor('--limite-resultado', 25_000); // chars num único tool_result

// Preço público Opus (USD por Mtok). Em plano de assinatura não vira fatura, mas é a
// única unidade comparável entre sessões — serve como régua, não como cobrança.
const PRECO = { input: 15, cacheCriacao: 18.75, cacheLeitura: 1.5, output: 75 };
const CHARS_POR_TOKEN = 3.7; // aproximação para pt-BR + código; usage.* é exato, isto não

const base = path.join(os.homedir(), '.claude', 'projects');
if (!fs.existsSync(base)) {
  saida({ erro: 'nenhum transcript encontrado em ~/.claude/projects' }, 1);
}

const slugAtual = process.cwd().replace(/\//g, '-');
const projetos = fs.readdirSync(base).filter(p => {
  if (!fs.statSync(path.join(base, p)).isDirectory()) return false;
  return flag('--todos') ? true : p === slugAtual;
});

if (!projetos.length) {
  saida({ erro: `sem transcript para ${process.cwd()}`, dica: 'rode com --todos para ver todos os projetos' }, 1);
}

const sessoes = [];
for (const proj of projetos) {
  for (const arq of fs.readdirSync(path.join(base, proj))) {
    if (!arq.endsWith('.jsonl')) continue;
    const s = analisar(path.join(base, proj, arq), proj, arq);
    if (s) sessoes.push(s);
  }
}

function analisar(caminho, proj, arq) {
  const linhas = fs.readFileSync(caminho, 'utf8').split('\n').filter(Boolean);
  const nomePorId = {};
  const s = {
    projeto: proj.replace(/^-Users-[^-]+-workspace-/, ''), sessao: arq.replace('.jsonl', '').slice(0, 8),
    requisicoes: 0, turnosUsuario: 0,
    tokens: { input: 0, cacheCriacao: 0, cacheLeitura: 0, output: 0 },
    contextoMaximo: 0, requisicoesAcimaDoLimite: 0,
    // Contexto da PRIMEIRA requisição: system prompt + definições de ferramenta +
    // CLAUDE.md + saída dos hooks. É o piso da sessão — pago antes de você digitar
    // qualquer coisa, e de novo em cada requisição seguinte.
    prefixo: 0,
    porFerramenta: {}, resultadosMonstro: [], imagens: { quantidade: 0, tokens: 0 },
    inicio: null, fim: null,
  };
  for (const linha of linhas) {
    let o; try { o = JSON.parse(linha); } catch { continue; }
    if (o.timestamp) { s.inicio ??= o.timestamp; s.fim = o.timestamp; }

    const uso = o.message?.usage;
    const ctxDoEvento = uso
      ? (uso.cache_read_input_tokens || 0) + (uso.cache_creation_input_tokens || 0) + (uso.input_tokens || 0)
      : 0;
    // Evento de `usage` todo zerado é marcador, não requisição (ver estado.mjs).
    if (uso && ctxDoEvento > 0) {
      s.requisicoes++;
      if (!s.prefixo) s.prefixo = ctxDoEvento;
      s.tokens.input += uso.input_tokens || 0;
      s.tokens.cacheCriacao += uso.cache_creation_input_tokens || 0;
      s.tokens.cacheLeitura += uso.cache_read_input_tokens || 0;
      s.tokens.output += uso.output_tokens || 0;
      if (ctxDoEvento > s.contextoMaximo) s.contextoMaximo = ctxDoEvento;
      if (ctxDoEvento > LIMITE_CTX) s.requisicoesAcimaDoLimite++;
    }

    const conteudo = o.message?.content;
    if (o.type === 'assistant' && Array.isArray(conteudo)) {
      for (const b of conteudo) if (b.type === 'tool_use') nomePorId[b.id] = b.name;
    }
    if (o.type === 'user') {
      if (typeof conteudo === 'string') s.turnosUsuario++;
      else if (Array.isArray(conteudo)) for (const b of conteudo) {
        if (b.type === 'text') { s.turnosUsuario++; continue; }
        if (b.type !== 'tool_result') continue;
        const nome = nomePorId[b.tool_use_id] || 'desconhecido';
        let chars = 0;
        if (typeof b.content === 'string') chars = b.content.length;
        else if (Array.isArray(b.content)) for (const p of b.content) {
          if (p.type === 'text') chars += (p.text || '').length;
          else if (p.type === 'image') {
            const d = p.source?.data?.length || 0;
            chars += d; s.imagens.quantidade++; s.imagens.tokens += Math.round(d / CHARS_POR_TOKEN);
          }
        }
        const f = (s.porFerramenta[nome] ??= { chamadas: 0, tokens: 0 });
        f.chamadas++; f.tokens += Math.round(chars / CHARS_POR_TOKEN);
        if (chars > LIMITE_RESULTADO) {
          s.resultadosMonstro.push({
            ferramenta: nome, tokens: Math.round(chars / CHARS_POR_TOKEN),
            requisicao: s.requisicoes,
            // custo de arrasto: o resultado é recobrado em toda requisição seguinte
            arrasto: Math.round((chars / CHARS_POR_TOKEN) * Math.max(0, s.requisicoes) / 1000),
          });
        }
      }
    }
  }
  if (!s.requisicoes) return null;
  s.custo = custoDe(s.tokens);
  s.contextoMedio = Math.round(s.tokens.cacheLeitura / s.requisicoes);
  s.resultadosMonstro.sort((a, b) => b.tokens - a.tokens);
  return s;
}

function custoDe(t) {
  return (t.input * PRECO.input + t.cacheCriacao * PRECO.cacheCriacao
        + t.cacheLeitura * PRECO.cacheLeitura + t.output * PRECO.output) / 1e6;
}

sessoes.sort((a, b) => b.custo - a.custo);

const total = sessoes.reduce((a, s) => ({
  requisicoes: a.requisicoes + s.requisicoes, custo: a.custo + s.custo,
  input: a.input + s.tokens.input, cacheCriacao: a.cacheCriacao + s.tokens.cacheCriacao,
  cacheLeitura: a.cacheLeitura + s.tokens.cacheLeitura, output: a.output + s.tokens.output,
}), { requisicoes: 0, custo: 0, input: 0, cacheCriacao: 0, cacheLeitura: 0, output: 0 });

// Quanto da releitura é só o piso: o prefixo volta em TODA requisição, então
// custa prefixo × requisições, sem nada a ver com o que a sessão fez.
const prefixos = sessoes.map((s) => s.prefixo).filter(Boolean).sort((a, b) => a - b);
const prefixoMediano = prefixos.length ? prefixos[Math.floor(prefixos.length / 2)] : 0;
const cacheLeituraDoPrefixo = sessoes.reduce((a, s) => a + s.prefixo * s.requisicoes, 0);

const ferramentas = {};
for (const s of sessoes) for (const [n, f] of Object.entries(s.porFerramenta)) {
  const a = (ferramentas[n] ??= { chamadas: 0, tokens: 0 });
  a.chamadas += f.chamadas; a.tokens += f.tokens;
}

const vereditos = [];
const ctxMedio = total.requisicoes ? Math.round(total.cacheLeitura / total.requisicoes) : 0;
if (ctxMedio > LIMITE_CTX) vereditos.push(
  `contexto médio relido ${mil(ctxMedio)} tok/req, acima do limite de ${mil(LIMITE_CTX)} — sessões longas demais; feche e /clear mais cedo`);
const monstros = sessoes.flatMap(s => s.resultadosMonstro);
if (monstros.length) vereditos.push(
  `${monstros.length} resultado(s) de ferramenta acima de ${mil(LIMITE_RESULTADO)} chars — o maior com ${mil(monstros.sort((a,b)=>b.tokens-a.tokens)[0].tokens)} tok; leia trecho, não arquivo inteiro`);
const imgs = sessoes.reduce((a, s) => a + s.imagens.quantidade, 0);
const imgTok = sessoes.reduce((a, s) => a + s.imagens.tokens, 0);
if (imgs) vereditos.push(`${imgs} imagem(ns) em contexto somando ~${mil(imgTok)} tok (~${mil(Math.round(imgTok/imgs))} cada) — screenshot só quando o visual é o objetivo`);
const parteCacheLeitura = total.custo ? 100 * total.cacheLeitura * PRECO.cacheLeitura / 1e6 / total.custo : 0;

const relatorio = {
  escopo: flag('--todos') ? 'todos os projetos' : process.cwd(),
  sessoes: sessoes.length, requisicoes: total.requisicoes,
  custoEstimadoUSD: Number(total.custo.toFixed(2)),
  contextoMedioPorRequisicao: ctxMedio,
  prefixoDaSessao: {
    mediano: prefixoMediano,
    minimo: prefixos[0] ?? 0,
    maximo: prefixos[prefixos.length - 1] ?? 0,
    parteDaReleitura: total.cacheLeitura ? Number((100 * cacheLeituraDoPrefixo / total.cacheLeitura).toFixed(1)) : 0,
  },
  distribuicaoDeCusto: {
    cacheLeitura: pct(total.cacheLeitura * PRECO.cacheLeitura, total.custo),
    cacheCriacao: pct(total.cacheCriacao * PRECO.cacheCriacao, total.custo),
    output: pct(total.output * PRECO.output, total.custo),
    inputNovo: pct(total.input * PRECO.input, total.custo),
  },
  porFerramenta: Object.fromEntries(Object.entries(ferramentas).sort((a, b) => b[1].tokens - a[1].tokens).slice(0, 10)),
  vereditos,
  maisCaras: sessoes.slice(0, 10).map(s => ({
    projeto: s.projeto, sessao: s.sessao, custoUSD: Number(s.custo.toFixed(2)),
    requisicoes: s.requisicoes, turnosUsuario: s.turnosUsuario,
    contextoMedio: s.contextoMedio, contextoMaximo: s.contextoMaximo,
    reqsAcimaDoLimite: s.requisicoesAcimaDoLimite,
  })),
};

saida(relatorio, vereditos.length ? 1 : 0);

function pct(parteTokPreco, custoTotal) {
  return custoTotal ? Number((100 * parteTokPreco / 1e6 / custoTotal).toFixed(1)) : 0;
}
function mil(n) { return n.toLocaleString('pt-BR'); }

function saida(obj, codigo) {
  if (JSON_OUT) { process.stdout.write(JSON.stringify(obj, null, 2) + '\n'); process.exit(codigo); }
  if (obj.erro) { console.error('erro: %s%s', obj.erro, obj.dica ? `\n  → ${obj.dica}` : ''); process.exit(codigo); }
  const r = obj;
  console.log('\n  CUSTO DE TOKEN — %s', r.escopo);
  console.log('  %d sessão(ões) · %s requisições · ~US$ %s (régua a preço Opus)\n', r.sessoes, mil(r.requisicoes), r.custoEstimadoUSD.toFixed(2));
  console.log('  Onde o custo nasce:');
  console.log('    contexto relido (cache read) : %s%%', String(r.distribuicaoDeCusto.cacheLeitura).padStart(5));
  console.log('    gravação de cache            : %s%%', String(r.distribuicaoDeCusto.cacheCriacao).padStart(5));
  console.log('    output (o que o modelo gera) : %s%%', String(r.distribuicaoDeCusto.output).padStart(5));
  console.log('    input novo                   : %s%%', String(r.distribuicaoDeCusto.inputNovo).padStart(5));
  console.log('\n  Contexto médio relido por requisição: %s tok  (limite: %s)', mil(r.contextoMedioPorRequisicao), mil(LIMITE_CTX));
  const p = r.prefixoDaSessao;
  console.log('  Prefixo da sessão (system prompt + ferramentas + CLAUDE.md + hooks):');
  console.log('    mediana %s tok  ·  faixa %s–%s  ·  responde por %s%% de toda a releitura',
    mil(p.mediano), mil(p.minimo), mil(p.maximo), p.parteDaReleitura);
  console.log('\n  O que ocupa o contexto:');
  for (const [n, f] of Object.entries(r.porFerramenta))
    console.log('    %s %s tok em %s chamada(s)  (média %s)', n.padEnd(22), mil(f.tokens).padStart(9), String(f.chamadas).padStart(5), mil(Math.round(f.tokens / f.chamadas)));
  console.log('\n  Sessões mais caras:');
  console.log('    US$     reqs  turnos  ctx médio  ctx pico  projeto');
  for (const s of r.maisCaras)
    console.log('    %s  %s  %s  %s  %s  %s', s.custoUSD.toFixed(2).padStart(7), String(s.requisicoes).padStart(4),
      String(s.turnosUsuario).padStart(5), mil(s.contextoMedio).padStart(9), mil(s.contextoMaximo).padStart(8), s.projeto);
  if (r.vereditos.length) {
    console.log('\n  VEREDITO — fora do orçamento:');
    for (const v of r.vereditos) console.log('    ✗ %s', v);
  } else console.log('\n  ✓ dentro do orçamento.');
  console.log();
  process.exit(codigo);
}
