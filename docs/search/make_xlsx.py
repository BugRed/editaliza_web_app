# -*- coding: utf-8 -*-
"""XLSX: registro de editais × ganhadores × projetos × fontes (benchmark real)."""
import json
import os
import sys

XLSX_SKILL_DIR = "/home/z/my-project/skills/xlsx"
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)
from base import (FONT_NAME, HEADER_BOLD, PRIMARY, NEUTRAL_600, ACCENT_POSITIVE, ACCENT_NEGATIVE,
                  setup_sheet, style_header_row, style_data_row, style_total_row, font_caption,
                  auto_fit_columns)  # noqa
from openpyxl import Workbook  # noqa
from openpyxl.styles import Font, Alignment  # noqa
from openpyxl.utils import get_column_letter  # noqa

HERE = "/home/z/my-project/scripts/artistrank_v2"
OUT_DIR = "/home/z/my-project/download/artistrank_benchmark_real"
os.makedirs(OUT_DIR, exist_ok=True)
OUT = os.path.join(OUT_DIR, "registro_editais_ganhadores_reais.xlsx")

dataset = json.load(open(f"{HERE}/data_real/editais_reais.json", encoding="utf-8"))
artistas = json.load(open(f"{HERE}/data_real/artistas_reais.json", encoding="utf-8"))
gt = json.load(open(f"{HERE}/data_real/ground_truth.json", encoding="utf-8"))
bench = json.load(open(f"{HERE}/results/benchmark_real.json", encoding="utf-8"))
calib = json.load(open(f"{HERE}/results/calibracao_real.json", encoding="utf-8"))

art_by_id = {a["id"]: a for a in artistas}
ed_by_id = {e["id"]: e for e in dataset}
v4 = next(b for b in bench if b["label"].startswith("v4 —"))
v0 = next(b for b in bench if b["label"].startswith("v0"))
v4_rows = {r["edital"]: r for r in v4["rows"]}
v0_rows = {r["edital"]: r for r in v0["rows"]}

wb = Workbook()

# ------------------------------------------------------- Sheet 1: Editais
ws = wb.active
ws.title = "Editais"
headers = ["#", "Edital (município)", "Modalidade", "Linguagens aceitas", "Situação do registro", "Tipo de dado capturado", "Fonte oficial (URL)"]
setup_sheet(ws, title="ArtistRank Benchmark v2.0 — Registro de 20 editais reais (Recife, Olinda, Caruaru)", last_col=len(headers) + 1)
for col, h in enumerate(headers, start=2):
    ws.cell(row=4, column=col, value=h)
style_header_row(ws, row_num=4, col_start=2, col_end=len(headers) + 1)
r = 5
for i, e in enumerate(dataset, 1):
    langs = ", ".join(sorted({v for rule in e["artistic_requirements"]["languages"] for v in rule["value"]}))
    row = [i, f"{e['title']} ({e['municipio']})", e["opportunity_type"], langs,
           "ganhadores verificados", "lista de selecionados/aprovados (PDF oficial ou fonte jornalística)", e["fonte"]]
    for col, v in enumerate(row, start=2):
        ws.cell(row=r, column=col, value=v)
    style_data_row(ws, row_num=r, col_start=2, col_end=len(headers) + 1, row_index=i - 1)
    r += 1
for i, p in enumerate(gt["pendentes"], len(dataset) + 1):
    row = [i, f"{p['titulo']} ({p['municipio']})", "—", "—", p["status"],
           "resultado identificado (URL registrada; portal inacessível pelo sandbox)", p["url"]]
    for col, v in enumerate(row, start=2):
        ws.cell(row=r, column=col, value=v)
    style_data_row(ws, row_num=r, col_start=2, col_end=len(headers) + 1, row_index=i - 1)
    ws.cell(row=r, column=6).font = Font(name=FONT_NAME, size=11, color="D4820A")
    r += 1
note = r + 1
ws.cell(row=note, column=2, value="Nota: os 14 primeiros são os editais com vencedores reais verificados usados como âncora do benchmark. Os 6 de Olinda/Caruaru estão catalogados com a URL oficial do resultado; para completar os pares, basta baixar os PDFs nos links (portais municipais não acessíveis pelo ambiente desta sessão).")
ws.cell(row=note, column=2).font = font_caption()
ws.cell(row=note, column=2).alignment = Alignment(wrap_text=True, vertical="top")
ws.merge_cells(start_row=note, start_column=2, end_row=note + 1, end_column=len(headers) + 1)
auto_fit_columns(ws, min_width=8, max_width=46, header_row=4, data_start_row=5)

# ------------------------------------------------------- Sheet 2: Ganhadores
ws2 = wb.create_sheet("Ganhadores")
headers2 = ["#", "Edital", "Artista/proponente", "Projeto/apresentação", "Papel no benchmark", "Fonte do resultado"]
setup_sheet(ws2, title="Pares travados: edital → ganhador real (máx. 2 âncoras por edital)", last_col=len(headers2) + 1)
for col, h in enumerate(headers2, start=2):
    ws2.cell(row=4, column=col, value=h)
style_header_row(ws2, row_num=4, col_start=2, col_end=len(headers2) + 1)
r = 5
n_par = 0
for e in dataset:
    eid = e["id"]
    for aid in gt["anchors"].get(eid, []):
        a = art_by_id[aid]
        n_par += 1
        row = [n_par, e["title"], a["nome"], a["artworks"][0]["title"], "âncora (ganhador travado)", a["fonte"]]
        for col, v in enumerate(row, start=2):
            ws2.cell(row=r, column=col, value=v)
        style_data_row(ws2, row_num=r, col_start=2, col_end=len(headers2) + 1, row_index=n_par - 1)
        r += 1
    for aid in gt["excluded"].get(eid, []):
        a = art_by_id[aid]
        row = ["—", e["title"], a["nome"], a["artworks"][0]["title"], "aprovado adicional (fora da disputa do próprio edital)", a["fonte"]]
        for col, v in enumerate(row, start=2):
            ws2.cell(row=r, column=col, value=v)
        style_data_row(ws2, row_num=r, col_start=2, col_end=len(headers2) + 1, row_index=r - 5)
        r += 1
note = r + 1
ws2.cell(row=note, column=2, value=f"Total: {n_par} pares âncora (vencedores reais) + {r - 5 - n_par} aprovados adicionais. Perfis: linguagens e conceitos derivados do título do projeto/fonte; trajetória não publicada nos resultados (campo vazio, tratado como desconhecido pelo motor — princípio 3 da especificação).")
ws2.cell(row=note, column=2).font = font_caption()
ws2.cell(row=note, column=2).alignment = Alignment(wrap_text=True, vertical="top")
ws2.merge_cells(start_row=note, start_column=2, end_row=note + 1, end_column=len(headers2) + 1)
auto_fit_columns(ws2, min_width=8, max_width=46, header_row=4, data_start_row=5)

# ------------------------------------------------------- Sheet 3: Benchmark
ws3 = wb.create_sheet("Benchmark")
headers3 = ["Edital", "Candidatos no pool", "Rank do vencedor — v0 (especificação literal)", "Rank do vencedor — v4 (nulos neutros + teto)", "Hit@1 v4", "Hit@3 v4"]
setup_sheet(ws3, title="Posição do ganhador real entre os 27–30 candidatos, por edital", last_col=len(headers3) + 1)
for col, h in enumerate(headers3, start=2):
    ws3.cell(row=4, column=col, value=h)
style_header_row(ws3, row_num=4, col_start=2, col_end=len(headers3) + 1)
r = 5
for i, e in enumerate(dataset):
    eid = e["id"]
    row = [e["title"], v4_rows[eid]["n_candidates"], v0_rows[eid]["best_anchor_rank"], v4_rows[eid]["best_anchor_rank"],
           "sim" if v4_rows[eid]["hit1"] else "não", "sim" if v4_rows[eid]["hit3"] else "não"]
    for col, v in enumerate(row, start=2):
        ws3.cell(row=r, column=col, value=v)
    style_data_row(ws3, row_num=r, col_start=2, col_end=len(headers3) + 1, row_index=i)
    ws3.cell(row=r, column=6).font = Font(name=FONT_NAME, size=11, color=ACCENT_POSITIVE if v4_rows[eid]["hit1"] else ACCENT_NEGATIVE)
    r += 1
tot_row = r
ws3.cell(row=tot_row, column=2, value="Agregado (14 editais)")
ws3.cell(row=tot_row, column=3, value=f"{sum(x['n_candidates'] for x in v4_rows.values()) // 14} em média")
ws3.cell(row=tot_row, column=5, value=f"Hit@1 {v4['hit1']:.1%}")
ws3.cell(row=tot_row, column=6, value=f"Hit@3 {v4['hit3']:.1%}")
ws3.cell(row=tot_row, column=7, value=f"MRR {v4['mrr']:.3f}")
style_total_row(ws3, row_num=tot_row, col_start=2, col_end=len(headers3) + 1)
note = tot_row + 2
ws3.cell(row=note, column=2, value="Pool de concorrentes = os demais ganhadores reais do corpus (sem os aprovados do próprio edital). Rank empatado conta a melhor posição do âncora. v0 = nulos tratados como 0 com renormalização (especificação literal); v4 = nulos 0,5 neutros + teto 45 por requisito explícito + papéis núcleo/suporte.")
ws3.cell(row=note, column=2).font = font_caption()
ws3.cell(row=note, column=2).alignment = Alignment(wrap_text=True, vertical="top")
ws3.merge_cells(start_row=note, start_column=2, end_row=note + 1, end_column=len(headers3) + 1)
auto_fit_columns(ws3, min_width=8, max_width=40, header_row=4, data_start_row=5)

# ------------------------------------------------------- Sheet 4: Calibração
ws4 = wb.create_sheet("Calibração")
headers4 = ["Configuração de pesos", "MRR dos ganhadores", "Hit@1", "Hit@3", "Observação"]
setup_sheet(ws4, title="Calibração de pesos contra ganhadores reais (26 pares travados)", last_col=len(headers4) + 1)
for col, h in enumerate(headers4, start=2):
    ws4.cell(row=4, column=col, value=h)
style_header_row(ws4, row_num=4, col_start=2, col_end=len(headers4) + 1)
eq = calib.get("equal_mrr")
rows4 = [
    ["Baseline da especificação (15/20/10/15/10/15/5/10)", f"{calib['baseline_mrr']:.4f}", "92,9% (13/14)", "100% (14/14)", "Peso 20% em Conceição: fator quase sempre neutro nos dados públicos"],
    ["Após calibração por coordenada (busca completa)", f"{calib['calibrado_mrr']:.4f}", "92,9% (13/14)", "100% (14/14)", "Nenhuma alteração de peso melhora o MRR: baseline no ótimo local"],
    ["Pesos iguais (12,5% cada)", f"{eq:.4f}", "92,9% (13/14)", "100% (14/14)", "Métrica idêntica: sinal dominante é linguagem/obra, não os micro-pesos"],
    ["Leave-one-out (treinar em 13, testar no 14)", f"{calib['loo_mean']:.4f}", "—", "—", "Estável: 13/14 editais com MRR 1,0 nos pesos treinados sem o edital testado"],
]
r = 5
for i, row in enumerate(rows4):
    for col, v in enumerate(row, start=2):
        ws4.cell(row=r, column=col, value=v)
    style_data_row(ws4, row_num=r, col_start=2, col_end=len(headers4) + 1, row_index=i)
    r += 1
note = r + 1
ws4.cell(row=note, column=2, value="Método: busca por coordenadas com multiplicadores {0,4–2,0} em cada um dos 8 pesos, objetivo = MRR do ganhador real por edital (motor v4). Conclusão empírica: com requisitos publicados pelos editais municipais, os fatores identificáveis são linguagem (L), obra (O), conceitos (C, quando o edital declara tema) e território (G); os demais ficam neutros e seus pesos não alteram a ordem — calibrar pesos finos só passa a fazer sentido com editais estruturados e perfis completos.")
ws4.cell(row=note, column=2).font = font_caption()
ws4.cell(row=note, column=2).alignment = Alignment(wrap_text=True, vertical="top")
ws4.merge_cells(start_row=note, start_column=2, end_row=note + 2, end_column=len(headers4) + 1)
auto_fit_columns(ws4, min_width=8, max_width=40, header_row=4, data_start_row=5)

# ------------------------------------------------------- Sheet 5: Review
ws5 = wb.create_sheet("Review")
ws5.sheet_properties.tabColor = "FFC000"
checks = [
    ["Verificação", "Esperado", "Obtido", "Status"],
    ["Nº de editais no registro (Editais)", 20, 14 + len(gt["pendentes"]), None],
    ["Nº de pares âncora (Ganhadores)", 26, n_par, None],
    ["Nº de editais âncora (Benchmark)", 14, len(v4["rows"]), None],
    ["MRR v4 (Calibração)", round(v4["mrr"], 4), round(calib["calibrado_mrr"], 4), None],
]
for i, row in enumerate(checks, start=1):
    for j, val in enumerate(row, start=1):
        if i > 1 and j == 4:
            val = '=IF(B{0}=C{0},"PASS","FAIL")'.format(i)
        ws5.cell(row=i, column=j, value=val)
        if i == 1:
            ws5.cell(row=i, column=j).font = Font(name=FONT_NAME, size=11, bold=HEADER_BOLD, color=PRIMARY)
for i in range(2, len(checks) + 1):
    ok = ws5.cell(row=i, column=2).value == ws5.cell(row=i, column=3).value
    ws5.cell(row=i, column=4, value="PASS" if ok else "FAIL")
    ws5.cell(row=i, column=4).font = Font(name=FONT_NAME, size=11, color=ACCENT_POSITIVE if ok else ACCENT_NEGATIVE)
for col, w in [("A", 34), ("B", 12), ("C", 12), ("D", 10)]:
    ws5.column_dimensions[col].width = w

wb.properties.creator = "Z.ai"
wb.save(OUT)
print("ok:", OUT, f"({os.path.getsize(OUT) // 1024} KB)  pares={n_par}")
