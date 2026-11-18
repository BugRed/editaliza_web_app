# -*- coding: utf-8 -*-
"""XLSX v3: registro de editais, pares travados, não-ganhadores, benchmark, rótulos/alpha, calibração, review."""
import json
import os
import sys

XLSX_SKILL_DIR = "/home/z/my-project/skills/xlsx"
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)
from base import (FONT_NAME, HEADER_BOLD, PRIMARY, ACCENT_POSITIVE, ACCENT_NEGATIVE,
                  setup_sheet, style_header_row, style_data_row, style_total_row, font_caption,
                  auto_fit_columns)  # noqa
from openpyxl import Workbook  # noqa
from openpyxl.styles import Font, Alignment  # noqa

HERE = "/home/z/my-project/scripts/artistrank_v3"
OUT_DIR = "/home/z/my-project/download/artistrank_benchmark_v3"
os.makedirs(OUT_DIR, exist_ok=True)
OUT = os.path.join(OUT_DIR, "registro_editais_ganhadores_reais_v3.xlsx")

D = json.load(open(f"{HERE}/data_v3/dataset_v3_full.json", encoding="utf-8"))
bench = json.load(open(f"{HERE}/results/benchmark_v3.json", encoding="utf-8"))
calib = json.load(open(f"{HERE}/results/calibracao_v3.json", encoding="utf-8"))
rot = json.load(open(f"{HERE}/results/rotulos_v3.json", encoding="utf-8"))
ART = {a["id"]: a for a in D["artistas"]}
GT = D["gt"]

wb = Workbook()

# ---------------------------------------------------------------- Editais
ws = wb.active
ws.title = "Editais"
headers = ["#", "Edital (município)", "Ano", "Modalidade", "Status do resultado", "Requisitos além de linguagem", "Fonte oficial (URL)"]
setup_sheet(ws, title="ArtistRank Benchmark v3 — 29 editais (23 verificados + 6 pendentes)", last_col=len(headers) + 1)
for col, h in enumerate(headers, start=2):
    ws.cell(row=4, column=col, value=h)
style_header_row(ws, row_num=4, col_start=2, col_end=len(headers) + 1)
r = 5
for i, e in enumerate(D["editais"], 1):
    reqs = [x["fator"] for x in e.get("requisitos_explicitos", []) if x["fator"] != "territorio"]
    row = [i, f"{e['title']} ({e['municipio']})", e.get("ano"), e["opportunity_type"], "verificado",
           ", ".join(reqs) or "—", (e.get("fontes") or [""])[0]]
    for col, v in enumerate(row, start=2):
        ws.cell(row=r, column=col, value=v)
    style_data_row(ws, row_num=r, col_start=2, col_end=len(headers) + 1, row_index=i - 1)
    r += 1
for j, p in enumerate(GT["pendentes"], len(D["editais"]) + 1):
    row = [j, f"{p['titulo']} ({p['municipio']})", "", "—", "pendente — portal inacessível pelo ambiente", "—", p["url"]]
    for col, v in enumerate(row, start=2):
        ws.cell(row=r, column=col, value=v)
    style_data_row(ws, row_num=r, col_start=2, col_end=len(headers) + 1, row_index=j - 1)
    ws.cell(row=r, column=6).font = Font(name=FONT_NAME, size=11, color="D4820A")
    r += 1
auto_fit_columns(ws, min_width=8, max_width=52, header_row=4, data_start_row=5)

# ---------------------------------------------------------------- Pares travados
ws2 = wb.create_sheet("Pares_travados")
headers2 = ["#", "Edital", "Artista/proponente", "Posição na seleção", "Projeto/obra âncora", "URL do resultado"]
setup_sheet(ws2, title="44 pares vencedor-edital travados (máx. 2 âncoras por edital)", last_col=len(headers2) + 1)
for col, h in enumerate(headers2, start=2):
    ws2.cell(row=4, column=col, value=h)
style_header_row(ws2, row_num=4, col_start=2, col_end=len(headers2) + 1)
r = 5
n = 0
for eid, lst in GT["anchors"].items():
    e = next(x for x in D["editais"] if x["id"] == eid)
    for aid in lst:
        a = ART[aid]
        n += 1
        row = [n, e["title"], a["nome"], a.get("posicao_na_selecao", ""),
               a["artworks"][0]["title"][:90], a.get("fonte_url", "")]
        for col, v in enumerate(row, start=2):
            ws2.cell(row=r, column=col, value=v)
        style_data_row(ws2, row_num=r, col_start=2, col_end=len(headers2) + 1, row_index=n - 1)
        r += 1
auto_fit_columns(ws2, min_width=8, max_width=52, header_row=4, data_start_row=5)

# ---------------------------------------------------------------- Não ganhadores (todos)
ws3 = wb.create_sheet("Nao_ganhadores")
headers3 = ["Edital", "Candidato/a", "Situação", "Projeto inscrito", "Linguagem (evidência)", "Fonte"]
setup_sheet(ws3, title="Candidatos reais que não ganharam (por situação e fonte) — corpus completo", last_col=len(headers3) + 1)
for col, h in enumerate(headers3, start=2):
    ws3.cell(row=4, column=col, value=h)
style_header_row(ws3, row_num=4, col_start=2, col_end=len(headers3) + 1)
r = 5
i = 0
for eid, cids in D["candidacy_map"].items():
    e = next(x for x in D["editais"] if x["id"] == eid)
    for cid in cids:
        c = D["candidatos"][cid]
        if c["situacao"] == "selecionado":
            continue  # aprovados adicionais estão nas abas de âncoras do edital? não — viram aprovados_adicionais
        row = [e["title"], c["nome"], c["situacao"], c["artworks"][0]["title"][:80],
               ", ".join(c["languages_main"]) or "—", c["fonte"][:70]]
        for col, v in enumerate(row, start=2):
            ws3.cell(row=r, column=col, value=v)
        style_data_row(ws3, row_num=r, col_start=2, col_end=len(headers3) + 1, row_index=i)
        i += 1
        r += 1
ws3.cell(row=r + 1, column=2, value=f"Total de linhas: {i}. Candidatos aprovados adicionais (selecionados fora das âncoras) constam como 'selecionado' no JSON e ficam fora da disputa do próprio edital.")
ws3.cell(row=r + 1, column=2).font = font_caption()
auto_fit_columns(ws3, min_width=8, max_width=44, header_row=4, data_start_row=5)

# ---------------------------------------------------------------- Resultados benchmark
ws4 = wb.create_sheet("Benchmark")
v4 = bench["configs"]["v4_neutros_teto_papeis"]
headers4 = ["Edital (métrica computável)", "Candidatos no pool", "Rank da âncora (v4)", "Nota sobre empates"]
setup_sheet(ws4, title="Posição do ganhador real — 10 editais com não-ganhadores publicados", last_col=len(headers4) + 1)
for col, h in enumerate(headers4, start=2):
    ws4.cell(row=4, column=col, value=h)
style_header_row(ws4, row_num=4, col_start=2, col_end=len(headers4) + 1)
r = 5
i = 0
for row_ in v4["rows"]:
    if row_.get("skip"):
        continue
    tie_note = "empatado no topo" if row_["rank"] == 1 and row_["n"] > 2 else ""
    row = [row_["edital"], row_["n"], row_["rank"], tie_note]
    for col, v in enumerate(row, start=2):
        ws4.cell(row=r, column=col, value=v)
    style_data_row(ws4, row_num=r, col_start=2, col_end=len(headers4) + 1, row_index=i)
    i += 1
    r += 1
tot = r
ws4.cell(row=tot, column=2, value="Agregado (10 editais computáveis)")
ws4.cell(row=tot, column=4, value=f"MRR {v4['mrr']:.3f}".replace(".", ","))
ws4.cell(row=tot, column=5, value=f"AUC {v4['auc_medio']:.3f} | NDCG@5 {v4['ndcg5_medio']:.3f}".replace(".", ","))
style_total_row(ws4, row_num=tot, col_start=2, col_end=len(headers4) + 1)
r = tot + 2
ws4.cell(row=r, column=2, value="Leitura honesta: com perfis extraídos apenas dos resultados oficiais, as notas empatam — o rank 1 é compartilhado com centenas de candidatos no Multilinguagens. AUC ≈ 0,52 mostra que o motor NÃO separa ganhou de não-ganhou com esses dados (veja aba Calibração e o relatório).")
ws4.cell(row=r, column=2).font = font_caption()
ws4.cell(row=r, column=2).alignment = Alignment(wrap_text=True, vertical="top")
ws4.merge_cells(start_row=r, start_column=2, end_row=r + 2, end_column=len(headers4) + 1)
r += 4
sec = r
ws4.cell(row=sec, column=2, value="Separação entre aprovados (18 editais SIC sem não-ganhadores publicados): âncora no topo em "
         f"{sum(1 for x in bench['separacao_aprovados'].values() if x['rank_ancora'] == 1)}/{len(bench['separacao_aprovados'])} — os dois aprovados de maior valor ficam à frente dos demais na nota do motor (teste de consistência, não de acerto).")
ws4.cell(row=sec, column=2).font = font_caption()
ws4.cell(row=sec, column=2).alignment = Alignment(wrap_text=True, vertical="top")
ws4.merge_cells(start_row=sec, start_column=2, end_row=sec + 1, end_column=len(headers4) + 1)
auto_fit_columns(ws4, min_width=8, max_width=52, header_row=4, data_start_row=5)

# ---------------------------------------------------------------- Rótulos e alpha
ws5 = wb.create_sheet("Rotulos_alpha")
headers5 = ["Item", "Valor", "Nota"]
setup_sheet(ws5, title="Rótulos (2 avaliadores) e varredura do alpha", last_col=len(headers5) + 1)
for col, h in enumerate(headers5, start=2):
    ws5.cell(row=4, column=col, value=h)
style_header_row(ws5, row_num=4, col_start=2, col_end=len(headers5) + 1)
rows5 = [
    ["Pares rotulados", rot["n_pares"], "artista × edital elegível no pool"],
    ["Kappa ponderado (quadrático)", f"{rot['kappa_ponderado']:.4f}".replace(".", ","), "A = rubrica estruturada; B = TF-IDF cego, escala relativa por edital"],
    ["Concordância simples", f"{rot['concordancia_simples']:.4f}".replace(".", ","), "baixa: as duas camadas capturam sinais distintos"],
    ["Rótulos de ganhador real (travados = 3)", rot["n_rotulos_ganhador_real"], "tipo_rotulo = ganhador_real"],
    ["Rótulos de aprovado real", rot["n_rotulos_aprovado_real"], "tipo_rotulo = aprovado_real"],
    ["Pares fora da linguagem (rótulo 0)", rot["n_pares_fora_linguagem"], "prova de não-aprovação por engano"],
]
r = 5
for i, row in enumerate(rows5):
    for col, v in enumerate(row, start=2):
        ws5.cell(row=r, column=col, value=v)
    style_data_row(ws5, row_num=r, col_start=2, col_end=len(headers5) + 1, row_index=i)
    r += 1
r += 1
ws5.cell(row=r, column=2, value="Varredura do alpha (subconjunto multi-obra: multilinguagens + FIDR)")
ws5.cell(row=r, column=2).font = Font(name=FONT_NAME, size=11, bold=HEADER_BOLD, color=PRIMARY)
r += 1
for alpha, m in bench["alpha_sweep"].items():
    ws5.cell(row=r, column=2, value=f"alpha = {alpha}")
    ws5.cell(row=r, column=3, value=f"MRR {m['mrr']:.3f} (n={m['n']})".replace(".", ","))
    ws5.cell(row=r, column=4, value="achatado: as obras de um mesmo perfil pontuam quase igual com dados públicos")
    style_data_row(ws5, row_num=r, col_start=2, col_end=len(headers5) + 1, row_index=r - 5)
    r += 1
r += 1
for dd in bench["discordancia_melhor_media"]:
    ws5.cell(row=r, column=2, value="Discordância melhor-obra × média-3")
    ws5.cell(row=r, column=3, value=f"{dd['edital']}: {dd['top_por_melhor_obra']} ≠ {dd['top_por_media3']}")
    ws5.cell(row=r, column=4, value=dd["motivo"])
    style_data_row(ws5, row_num=r, col_start=2, col_end=len(headers5) + 1, row_index=r - 5)
    r += 1
ws5.cell(row=r, column=2, value="Mínimo pedido: 8 editais com discordância — não atingido (1 observado); causa: só 3 artistas com ≥3 obras e 5 com 2 no corpus público.")
ws5.cell(row=r, column=2).font = font_caption()
auto_fit_columns(ws5, min_width=8, max_width=60, header_row=4, data_start_row=5)

# ---------------------------------------------------------------- Calibração
ws6 = wb.create_sheet("Calibracao")
headers6 = ["Item", "Valor", "Nota"]
setup_sheet(ws6, title="Calibração no treino (split pré-registrado) + avaliação no teste", last_col=len(headers6) + 1)
for col, h in enumerate(headers6, start=2):
    ws6.cell(row=4, column=col, value=h)
style_header_row(ws6, row_num=4, col_start=2, col_end=len(headers6) + 1)
rows6 = [
    ["Split treino (15 editais)", ", ".join(calib["train"][:5]) + " …", "pré-registrado por hash(id)%3 antes de qualquer métrica"],
    ["Split teste (8 editais)", ", ".join(calib["test"][:5]) + " …", "avaliado só depois da calibração"],
    ["MRR treino — baseline", f"{calib['baseline_mrr_train']:.4f}".replace(".", ","), "empates estruturais: MRR insensível"],
    ["MRR treino — após calibração", f"{calib['calibrado_mrr_train']:.4f}".replace(".", ","), "trace vazio: nenhum peso se moveu"],
    ["Pesos após calibração", ", ".join(f"{k} {v}%" for k, v in calib["pesos_calibrados_pct"].items()), "idênticos à especificação"],
    ["MRR teste — baseline", f"{calib['baseline_mrr_test']:.4f}".replace(".", ","), "resultado vale no teste"],
    ["MRR teste — pesos calibrados", f"{calib['teste_mrr_calibrado']:.4f}".replace(".", ","), "idêntico ao baseline"],
    ["MRR LOO no treino", f"{calib['loo_mean']:.4f}".replace(".", ","), f"só editais com não-ganhadores (n={len(calib['loo'])})"],
    ["Diagnóstico TF-IDF (AUC por edital)", "; ".join(f"{k.split('_')[-1][:12]}={v}" for k, v in list(calib["diagnostico_auc_tfidf"].items())[:6]) + " …", "camada semântica separa só em pools pequenos (solo/aprendiz = 1,0)"],
]
r = 5
for i, row in enumerate(rows6):
    for col, v in enumerate(row, start=2):
        ws6.cell(row=r, column=col, value=v)
    style_data_row(ws6, row_num=r, col_start=2, col_end=len(headers6) + 1, row_index=i)
    r += 1
ws6.cell(row=r + 1, column=2, value="Conclusão: a calibração continua plana porque (1) as notas empatam com perfis de resultados oficiais e (2) os fatores além de linguagem/obra permanecem neutros. MRR não é o métrico certo para decidir pesos neste corpus; AUC/NDCG com dados mais ricos é o caminho.")
ws6.cell(row=r + 1, column=2).font = font_caption()
ws6.cell(row=r + 1, column=2).alignment = Alignment(wrap_text=True, vertical="top")
ws6.merge_cells(start_row=r + 1, start_column=2, end_row=r + 3, end_column=len(headers6) + 1)
auto_fit_columns(ws6, min_width=8, max_width=60, header_row=4, data_start_row=5)

# ---------------------------------------------------------------- Review
ws7 = wb.create_sheet("Review")
ws7.sheet_properties.tabColor = "FFC000"
n_nao_ganh = sum(1 for c in D["candidatos"].values() if c["situacao"] != "selecionado")
checks = [
    ["Verificação", "Esperado", "Obtido"],
    ["Editais verificados", 23, len(D["editais"])],
    ["Pendentes (URL registrada)", 6, len(GT["pendentes"])],
    ["Pares âncora (≤2/edital)", 44, sum(len(v) for v in GT["anchors"].values())],
    ["Candidatos não-ganhadores", 759, n_nao_ganh],
    ["Casos de teto/elegibilidade", 9, len(json.load(open(f"{HERE}/data_v3/casos_elegibilidade_teto.json", encoding="utf-8")))],
    ["MRR v4 (recalculado em verify.py)", 1.0, bench["configs"]["v4_neutros_teto_papeis"]["mrr"]],
]
for i, row in enumerate(checks, start=1):
    for j, val in enumerate(row, start=1):
        ws7.cell(row=i, column=j, value=val)
        if i == 1:
            ws7.cell(row=i, column=j).font = Font(name=FONT_NAME, size=11, bold=HEADER_BOLD, color=PRIMARY)
for i in range(2, len(checks) + 1):
    exp, got = ws7.cell(row=i, column=2).value, ws7.cell(row=i, column=3).value
    okv = (exp == got) or (isinstance(exp, (int, float)) and isinstance(got, (int, float)) and abs(exp - got) < 1e-9)
    ws7.cell(row=i, column=4, value="PASS" if okv else "FAIL")
    ws7.cell(row=i, column=4).font = Font(name=FONT_NAME, size=11, color=ACCENT_POSITIVE if okv else ACCENT_NEGATIVE)
for col, w in [("A", 36), ("B", 22), ("C", 22), ("D", 10)]:
    ws7.column_dimensions[col].width = w

wb.properties.creator = "Z.ai"
wb.save(OUT)
print("ok:", OUT, f"({os.path.getsize(OUT) // 1024} KB)")
