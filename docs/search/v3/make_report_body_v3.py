# -*- coding: utf-8 -*-
"""Relatório v3 — corpo ReportLab + TOC (paleta fixa do Template 07, cadeia pdf skill).
Seção 0 na primeira página: o que mudou da v2 para a v3 e o que continua não provado."""
import hashlib
import json
import os
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (CondPageBreak, Image, KeepTogether, PageBreak,
                                Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle)
from reportlab.platypus.tableofcontents import TableOfContents

PDF_SKILL = "/home/z/my-project/skills/pdf"
sys.path.insert(0, os.path.join(PDF_SKILL, "scripts"))
HERE = "/home/z/my-project/scripts/artistrank_v3"

pdfmetrics.registerFont(TTFont("NotoSerifSC", "/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("NotoSerifSC-Bold", "/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Noto Sans SC", "/usr/share/fonts/truetype/chinese/NotoSansSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Noto Sans SC Bold", "/usr/share/fonts/truetype/chinese/NotoSansSC-Bold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif", "/usr/share/fonts/truetype/freefont/FreeSerif.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Bold", "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Italic", "/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-BoldItalic", "/usr/share/fonts/truetype/freefont/FreeSerifBoldItalic.ttf"))
registerFontFamily("NotoSerifSC", normal="NotoSerifSC", bold="NotoSerifSC-Bold")
registerFontFamily("Noto Sans SC", normal="Noto Sans SC", bold="Noto Sans SC Bold")
registerFontFamily("FreeSerif", normal="FreeSerif", bold="FreeSerif-Bold",
                   italic="FreeSerif-Italic", boldItalic="FreeSerif-BoldItalic")
from pdf import install_font_fallback  # noqa: E402
install_font_fallback()

PAGE_BG = colors.HexColor("#f5f8fc")
CARD_BG = colors.HexColor("#e4ecf5")
TABLE_STRIPE = colors.HexColor("#eef3fa")
HEADER_FILL = colors.HexColor("#1a4a7a")
BORDER = colors.HexColor("#c0d0e2")
ACCENT = colors.HexColor("#2d7ab3")
TEXT_PRIMARY = colors.HexColor("#142840")
TEXT_MUTED = colors.HexColor("#5a7a96")
NEG = colors.HexColor("#b04a3a")

D = json.load(open(f"{HERE}/data_v3/dataset_v3_full.json", encoding="utf-8"))
bench = json.load(open(f"{HERE}/results/benchmark_v3.json", encoding="utf-8"))
calib = json.load(open(f"{HERE}/results/calibracao_v3.json", encoding="utf-8"))
rot = json.load(open(f"{HERE}/results/rotulos_v3.json", encoding="utf-8"))
GT = D["gt"]
ART = {a["id"]: a for a in D["artistas"]}
v4 = bench["configs"]["v4_neutros_teto_papeis"]
v0 = bench["configs"]["v0_especificacao_literal"]

# gráfico: AUC motor v4 × diagnóstico TF-IDF, por edital computável
import matplotlib  # noqa: E402
matplotlib.use("Agg")
import matplotlib.font_manager as fm  # noqa: E402
fm.fontManager.addfont("/usr/share/fonts/truetype/chinese/NotoSansSC-Regular.ttf")
fm.fontManager.addfont("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
import matplotlib.pyplot as plt  # noqa: E402
plt.rcParams["font.sans-serif"] = ["Noto Sans SC", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

sys.path.insert(0, HERE)
from engine_v3 import rank_artist_edital, SPEC_WEIGHTS  # noqa: E402
ALLD = dict(ART)
ALLD.update(D["candidatos"])
EDS = {e["id"]: e for e in D["editais"]}


def pool_of_local(eid):
    import re, unicodedata
    def nn(s):
        s = unicodedata.normalize("NFKD", (s or "").lower()).encode("ascii", "ignore").decode()
        return re.sub(r"\s+", " ", s).strip()
    anchors = [x for x in GT["anchors"].get(eid, []) if x in ALLD]
    names = {nn(ALLD[x]["nome"]) for x in anchors}
    names |= {nn(ALLD[x]["nome"]) for x in GT["excluded"].get(eid, []) if x in ALLD}
    aprov = [x for x in GT["aprovados_adicionais"].get(eid, []) if x in ALLD]
    names |= {nn(ALLD[x]["nome"]) for x in aprov}
    comps, seen = [], set()
    for cid in D["candidacy_map"].get(eid, []):
        if cid in ALLD and nn(ALLD[cid]["nome"]) not in names and cid not in seen:
            comps.append(cid)
            seen.add(cid)
    for aid, cs in D.get("candidacias_promovidos", {}).items():
        if nn(ALLD[aid]["nome"]) not in names and any(
                c["edital"] == eid and c["situacao"] != "selecionado" for c in cs) and aid not in seen:
            comps.append(aid)
            seen.add(aid)
    return comps, anchors, aprov


lab_by = {}
for p in rot["pares"]:
    lab_by.setdefault(p["edital"], {})[p["artista"]] = p
auc_motor, auc_tfidf, ed_names = [], [], []
ed_short = {"multilinguagens_pnab2026": "Multilinguagens PNAB 26", "virado_pnab2026_hiphop": "Virado Hip-Hop PNAB 26",
            "solo_do_outro_2026": "Solo do Outro 26", "aprendiz_em_cena_2026": "Aprendiz em Cena 26",
            "bolsa_escola_frevo_2026": "Bolsa Escola de Frevo", "fidr_2026": "29º FIDR 2026",
            "sic2024_fic_musica": "FIC 2024 Música", "sic2024_fic_teatro": "FIC 2024 Teatro",
            "sic2024_fic_danca": "FIC 2024 Dança", "sic2024_fic_literatura": "FIC 2024 Literatura"}
for eid in ["multilinguagens_pnab2026", "virado_pnab2026_hiphop", "solo_do_outro_2026", "aprendiz_em_cena_2026",
            "bolsa_escola_frevo_2026", "fidr_2026", "sic2024_fic_musica", "sic2024_fic_teatro",
            "sic2024_fic_danca", "sic2024_fic_literatura"]:
    comps, anchors, aprov = pool_of_local(eid)
    if not comps or not anchors:
        continue
    sc = {}
    for cid in comps + anchors + aprov:
        r = rank_artist_edital(ALLD[cid], EDS[eid], weights=SPEC_WEIGHTS, null_mode="neutral", cap_on=True)
        sc[cid] = r["final"] if r["final"] is not None else -1.0
    lb = lab_by.get(eid, {})
    pos = [(c, sc[c]) for c in anchors + aprov if c in lb and lb[c]["rotulo_A"] >= 3]
    neg = [(c, sc[c]) for c in comps if c in lb and lb[c]["rotulo_A"] < 3]
    if pos and neg:
        w_ = sum(1 for _, sp in pos for _, sn in neg if sp > sn)
        t_ = sum(1 for _, sp in pos for _, sn in neg if sp == sn)
        auc_motor.append((w_ + 0.5 * t_) / (len(pos) * len(neg)))
        posc = [lb[c]["cos_tfidf"] for c, _ in pos]
        negc = [lb[c]["cos_tfidf"] for c, _ in neg]
        w2 = sum(1 for sp in posc for sn in negc if sp > sn)
        t2 = sum(1 for sp in posc for sn in negc if sp == sn)
        auc_tfidf.append((w2 + 0.5 * t2) / (len(posc) * len(negc)))
        ed_names.append(ed_short.get(eid, eid[:20]))

fig, ax = plt.subplots(figsize=(8.6, 5.2))
y = list(range(len(ed_names)))[::-1]
h = 0.38
ax.barh([i + h / 2 for i in y], auc_motor, height=h, color="#1a4a7a", label="motor v4 (estruturado)", edgecolor="none")
ax.barh([i - h / 2 for i in y], auc_tfidf, height=h, color="#2d7ab3", label="TF-IDF (diagnóstico)", edgecolor="none")
ax.axvline(0.5, color="#5a7a96", lw=1, ls="--")
ax.text(0.505, len(ed_names) - 0.4, "0,5 = sem separação", fontsize=8.5, color="#5a7a96")
ax.set_yticks(y)
ax.set_yticklabels(ed_names, fontsize=9.5)
ax.set_xlabel("AUC: separação entre ganhadores reais e não-ganhadores", fontsize=10)
ax.set_xlim(0, 1.05)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.spines["left"].set_visible(False)
ax.spines["bottom"].set_color("#c0d0e2")
ax.tick_params(colors="#5a7a96")
ax.legend(loc="lower right", frameon=False, fontsize=9.5)
fig.tight_layout(pad=1.6)
fig.savefig(f"{HERE}/results/fig_auc_v3.png", dpi=200)
plt.close(fig)

MARGIN = 0.9 * inch
AVAIL = A4[0] - 2 * MARGIN
st_body = ParagraphStyle("Body", fontName="FreeSerif", fontSize=10.5, leading=15.6,
                         alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceAfter=6)
st_h1 = ParagraphStyle("H1", fontName="NotoSerifSC", fontSize=17, leading=23, textColor=HEADER_FILL,
                       spaceBefore=13, spaceAfter=8)
st_h2 = ParagraphStyle("H2", fontName="NotoSerifSC", fontSize=13, leading=18, textColor=HEADER_FILL,
                       spaceBefore=12, spaceAfter=6)
st_caption = ParagraphStyle("Caption", fontName="FreeSerif-Italic", fontSize=8.5, leading=12,
                            alignment=TA_CENTER, textColor=TEXT_MUTED, spaceBefore=3, spaceAfter=6)
st_th = ParagraphStyle("TH", fontName="FreeSerif", fontSize=9.5, leading=13, alignment=TA_CENTER, textColor=colors.white)
st_td = ParagraphStyle("TD", fontName="FreeSerif", fontSize=9.5, leading=13, alignment=TA_LEFT,
                       textColor=TEXT_PRIMARY, wordWrap="CJK")
st_td_c = ParagraphStyle("TDC", parent=st_td, alignment=TA_CENTER)
st_stat = ParagraphStyle("Stat", fontName="FreeSerif", fontSize=20, leading=24, alignment=TA_CENTER, textColor=ACCENT)
st_stat_lbl = ParagraphStyle("StatL", fontName="FreeSerif", fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=TEXT_MUTED)
st_toc_title = ParagraphStyle("TocTitle", fontName="NotoSerifSC", fontSize=17, leading=22, textColor=HEADER_FILL, spaceAfter=14)
st_box = ParagraphStyle("Box", fontName="FreeSerif", fontSize=10, leading=15.5, textColor=TEXT_PRIMARY, spaceAfter=5)


class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, "bookmark_name"):
            self.notify("TOCEntry", (getattr(flowable, "bookmark_level", 0),
                                     getattr(flowable, "bookmark_text", ""),
                                     self.page - 1, getattr(flowable, "bookmark_key", "")))


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAGE_BG)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setFillColor(TEXT_MUTED)
    canvas.setFont("FreeSerif", 8)
    canvas.drawString(MARGIN, A4[1] - 0.55 * inch, "ArtistRank — Benchmark v3 com dados reais")
    canvas.drawRightString(A4[0] - MARGIN, A4[1] - 0.55 * inch, "Recife · Olinda · Caruaru")
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.8)
    canvas.line(MARGIN, A4[1] - 0.62 * inch, A4[0] - MARGIN, A4[1] - 0.62 * inch)
    canvas.drawCentredString(A4[0] / 2, 0.45 * inch, "i" if doc.page == 1 else str(doc.page - 1))
    canvas.restoreState()


def heading(text, level=0):
    key = "h_" + hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph(f'<a name="{key}"/><b>{text}</b>', st_h1 if level == 0 else st_h2)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p


def h1(story, text, first_para):
    story.append(CondPageBreak((A4[1] - 2 * MARGIN) * 0.25))
    story.append(KeepTogether([heading(text, 0), Paragraph(first_para, st_body)]))


def make_table(header, rows, ratios, aligns=None):
    widths = [w * AVAIL for w in ratios]
    data = [[Paragraph(f"<b>{h}</b>", st_th) for h in header]]
    for row in rows:
        cells = []
        for j, v in enumerate(row):
            stl = st_td_c if (aligns and aligns[j] == "c") else st_td
            txt = str(v)
            if (" — " in txt) or (" — " in txt):
                sep = " — " if " — " in txt else " — "
                head_, tail_ = txt.split(sep, 1)
                txt = f"{head_} ({tail_})"
                txt = txt.replace(" — ", " — ")
            cells.append(Paragraph(txt, stl))
        data.append(cells)
    t = Table(data, colWidths=widths, hAlign="CENTER", repeatRows=1)
    style = [("BACKGROUND", (0, 0), (-1, 0), HEADER_FILL), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
             ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
             ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
             ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]
    for i in range(1, len(data)):
        style.append(("BACKGROUND", (0, i), (-1, i), colors.white if i % 2 else TABLE_STRIPE))
    t.setStyle(TableStyle(style))
    return t


def callout_metrics(items):
    cells, widths = [], []
    for big, lbl in items:
        inner = Table([[Paragraph(f"<b>{big}</b>", st_stat)], [Paragraph(lbl, st_stat_lbl)]],
                      colWidths=[AVAIL / len(items) - 14])
        inner.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CARD_BG), ("BOX", (0, 0), (-1, -1), 1, ACCENT),
            ("TOPPADDING", (0, 0), (-1, 0), 8), ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
            ("TOPPADDING", (0, 1), (-1, 1), 2), ("BOTTOMPADDING", (0, 0), (-1, 0), 2)]))
        cells.append(inner)
        widths.append(AVAIL / len(items))
    wrap = Table([cells], colWidths=widths, hAlign="CENTER")
    wrap.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                              ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    return wrap


story = []
story.append(Paragraph("<b>Sumário</b>", st_toc_title))
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle("TOC0", fontName="FreeSerif", fontSize=11.5, leading=18, leftIndent=6, textColor=TEXT_PRIMARY),
    ParagraphStyle("TOC1", fontName="FreeSerif", fontSize=10.5, leading=15, leftIndent=24, textColor=TEXT_MUTED)]
story.append(toc)
story.append(PageBreak())

# ---- Seção 0 (primeira página do corpo): o que mudou v2 -> v3
story.append(heading("0. O que mudou da v2 para a v3 — e o que continua não provado", 0))
story.append(Paragraph("Mudou:", st_box.__class__(name="bx", parent=st_body, fontName="FreeSerif-Bold", spaceAfter=4)))
story.append(Paragraph(
    "1) O pool de concorrentes passou a conter <b>759 candidatos reais que não ganharam</b> (suplentes, "
    "desclassificados e habilitados publicados nos resultados), cada um com situação e fonte — na v2 o pool "
    "tinha só ganhadores, então o benchmark não media ganhou contra não-ganhou; "
    "2) a linguagem dos perfis passou a ter <b>origem declarada</b> (evidência do título/imprensa ou do "
    "resultado oficial), quebrando a circularidade da v2, em que a linguagem era herdada do segmento do "
    "edital; 3) requisitos além de linguagem foram extraídos com <b>trecho citado</b> para 6 editais; "
    "4) rótulos 0-3 por dois avaliadores independentes com kappa ponderado (0,20); 5) split treino/teste "
    "pré-registrado antes de qualquer métrica; 6) casos de elegibilidade e teto viraram testes automatizados "
    "(9 casos, todos passando); 7) o motor v3 corrigiu a semântica de listas de linguagens aceitas (any-of em "
    "vez de média entre linguagens) — na v2 essa média derrubava o ganhador do Multilinguagens para a posição "
    "92 de 623; 8)verify.py reproduz cada número do relatório a partir dos JSON e falha se algo divergir.", st_body))
story.append(Paragraph("Continua não provado:", st_body.__class__(name="bx2", parent=st_body, fontName="FreeSerif-Bold", spaceAfter=4)))
story.append(Paragraph(
    "1) o motor <b>não separa ganhou de não-ganhou</b> com perfis extraídos de resultados oficiais (AUC ≈ 0,52): "
    "as notas empatam porque os resultados publicam nome e título, não requisitos preenchidos por candidato; "
    "2) Hit@1 = 10/10 é <b>rank de empate</b> — a âncora nunca fica abaixo de ninguém, mas empatada com centenas; "
    "3) os pesos continuam sem se mover na calibração (MRR insensível sob empate); 4) multi-obra: 3 artistas com "
    "3-6 obras (mínimo pedido: 12 — não atingido, portfólios públicos não indexados); 5) 6 editais de Olinda e "
    "Caruaru seguem pendentes (portais inacessíveis pelo ambiente; URLs registradas). Score mede compatibilidade "
    "com o edital, não probabilidade de ganhar.", st_body))

# ---- 1. Sumário executivo
h1(story, "1. Sumário executivo",
   "A v3 reconstrói o benchmark do ArtistRank sobre dados públicos verificáveis, com duas perguntas: o motor "
   "coloca quem foi premiado no topo, e separa candidatos dentro de uma mesma linguagem? A primeira resposta "
   "é afirmativa com ressalva: em todos os 10 editais com não-ganhadores publicados, o ganhador real nunca "
   "fica abaixo de nenhum concorrente (rank 1 por empate). A segunda é negativa e é o achado central: com "
   "perfis extraídos apenas de resultados oficiais, as notas empatam estruturalmente e a separação "
   "ganhou-não-ganhou fica em nível de chance (AUC ≈ 0,52). O corpus tem 29 editais catalogados (23 "
   "verificados, 6 pendentes de captura), 44 pares vencedor-edital travados com URL e posição, 759 candidatos "
   "não-ganhadores e 1.202 pares rotulados por dois avaliadores independentes.")
story.append(Spacer(1, 6))
story.append(callout_metrics([
    ("23+6", "editais verificados + pendentes"),
    ("44", "pares vencedor-edital"),
    ("759", "não-ganhadores reais"),
    ("AUC 0,52", "separação ganhou × não-ganhou"),
]))
story.append(Spacer(1, 10))
story.append(Paragraph(
    "Três conclusões práticas saem disso. Primeira: a especificação v4 sobrevive aos testes de mecânica "
    "(elegibilidade, teto e papéis) e nunca coloca o ganhador real abaixo de um não-ganhador — o motor é seguro "
    "contra falso-negativos grosseiros. Segunda: a informação que separaria candidatos está nos textos de "
    "inscrição (projeto, portfólio, documentação), que não são publicados nos resultados; enquanto isso não "
    "mudar, ajustar pesos é prematuro — o MRR é insensível sob empate generalizado e a calibração não se move. "
    "Terceira: a camada semântica (TF-IDF sobre títulos) separa bem em pools pequenos (AUC 1,0 no Solo do Outro "
    "e no Aprendiz em Cena) mas não nos grandes (0,52 no Multilinguagens) — é a pista de que embeddings sobre "
    "descrições completas, e não ajuste de pesos, é o próximo investimento de dados.", st_body))

# ---- 2. Metodologia
h1(story, "2. Metodologia dos pares travados e dos candidatos",
   "Cada edital com resultado oficial publicado contribui com no máximo duas âncoras (ganhadores), escolhidas "
   "por posição publicada: nos editais de fomento com múltiplos aprovados, os dois de maior valor; nos editais "
   "com ordem de classificação, os dois primeiros; nos editais com nota publicada, os dois maiores escores. "
   "Cada âncora registra nome como publicado, projeto, posição e URL do resultado. Os demais aprovados ficam "
   "como aprovados adicionais, excluídos da disputa do próprio edital para não virarem falsos negativos. Os "
   "não-ganhadores (suplentes, desclassificados, habilitados) entram com situação e fonte; quando o resultado "
   "não publica não-ganhadores, o fato é registrado e o edital sai da métrica de separação.")
story.append(Paragraph(
    "A linguagem de cada perfil tem origem declarada: evidencia_propria (título do projeto, texto de imprensa) "
    "ou evidencia_resultado (coluna linguagem cultural do próprio resultado, como RAP no Virado). Nenhum perfil "
    "herda linguagem do nome do edital por omissão. Requisitos além de linguagem foram extraídos com trecho "
    "citado para seis editais (FIDR, Solo do Outro, Escola de Frevo, Multilinguagens, Virado e OBSERVA 3); para "
    "os editais do SIC 2023/2024 o PDF do edital não está acessível no portal e os requisitos ficaram "
    "não declarados — isso é registrado como limite, não preenchido de memória. Os rótulos 0-3 vêm de dois "
    "avaliadores independentes: o avaliador A aplica rubrica estruturada (elegibilidade, correspondência de "
    "linguagem, conceitos e técnicas); o avaliador B é cego ao resultado e pontua por similaridade TF-IDF em "
    "escala relativa dentro de cada edital. O kappa quadrático ponderado entre eles é 0,20 com concordância "
    "simples de 0,31 — concordância razoável-baixa, coerente com o fato de as duas camadas lerem sinais "
    "diferentes dos mesmos dados públicos.", st_body))

# ---- 3. Registro
h1(story, "3. Registro dos editais",
   "O registro completo está na planilha acompanhante (abas Editais, Pares_travados e Nao_ganhadores). A tabela "
   "abaixo resume os 23 editais verificados e os 6 pendentes. Os seis pendentes têm a URL oficial do resultado "
   "registrada no ground_truth.json; os portais municipais de Olinda e Caruaru não são alcançáveis pelo "
   "ambiente desta sessão, e nenhum nome foi preenchido de memória.")
rows_reg = []
for i, e in enumerate(D["editais"], 1):
    reqs = [x["fator"] for x in e.get("requisitos_explicitos", []) if x["fator"] != "territorio"]
    rows_reg.append([i, e["title"], e["municipio"], str(e.get("ano") or ""), ", ".join(reqs) or "nenhum capturado"])
for j, p in enumerate(GT["pendentes"], len(D["editais"]) + 1):
    rows_reg.append([j, p["titulo"], p["municipio"], "", "pendente"])
t_reg = make_table(["#", "Edital", "Município", "Ano", "Requisitos além de linguagem"],
                   rows_reg, [0.05, 0.42, 0.12, 0.08, 0.33], aligns=["c", "l", "c", "c", "l"])
story.append(Spacer(1, 8))
story.append(t_reg)
story.append(Paragraph("Tabela 1 — Registro de editais: 23 verificados + 6 pendentes (URLs no JSON e na planilha).", st_caption))

# ---- 4. Pares travados
h1(story, "4. Pares travados: ganhadores por edital",
   "São 44 pares âncora em 23 editais, com no máximo dois por edital. A tabela mostra as âncoras por edital, "
   "na ordem em que o resultado as publica. Nos editais do SIC, a âncora é o aprovado de maior valor; quando o "
   "próprio resultado publica nota (Multilinguagens, Virado) ou ordem de classificação (FIDR, Escola de Frevo), "
   "a âncora é o melhor colocado. Cada par tem URL do resultado e posição registrados no JSON e na planilha.")
rows_win = []
for e in D["editais"]:
    lst = GT["anchors"].get(e["id"], [])
    if not lst:
        continue
    nomes = "; ".join(ART[a]["nome"] for a in lst)
    pos = ART[lst[0]].get("posicao_na_selecao", "")
    rows_win.append([e["title"], nomes, pos])
t_win = make_table(["Edital", "Vencedores âncora", "Posição publicada da primeira âncora"],
                   rows_win, [0.32, 0.36, 0.32], aligns=["l", "l", "l"])
story.append(Spacer(1, 8))
story.append(t_win)
story.append(Paragraph("Tabela 2 — 44 pares vencedor-edital travados (âncoras). Aprovados adicionais: 290, fora da disputa do próprio edital.", st_caption))

# ---- 5. Resultados
h1(story, "5. Resultados por configuração, com intervalo de confiança",
   "As métricas de ranking usam os 10 editais com não-ganhadores publicados (os 13 editais do SIC sem listas "
   "de não-ganhadores são reportados na métrica secundária de consistência entre aprovados). As quatro "
   "configurações pedidas foram rodadas: v0 (nulo=0 com denominador cheio, sem teto), v2 (teto de 45), v4 "
   "(nulos neutros 0,5 + teto + papéis) e v4 com pesos iguais. O intervalo de confiança é bootstrap por edital "
   "(2.000 reamostragens).")
t_met = make_table(
    ["Configuração", "MRR", "Hit@1", "Hit@3", "AUC", "NDCG@5"],
    [["v0 — especificação literal", "1,000", "10/10", "10/10", "0,510", "0,962"],
     ["v2 — teto por requisito explícito", "1,000", "10/10", "10/10", "0,510", "0,962"],
     ["v4 — nulos neutros + teto + papéis", "1,000", "10/10", "10/10", "0,520", "0,962"],
     ["v4 com pesos iguais", "1,000", "10/10", "10/10", "0,520", "0,962"],
     ["IC 95% (bootstrap por edital, v4)", "[1,0; 1,0]", "[1,0; 1,0]", "[1,0; 1,0]", "n/a", "n/a"]],
    [0.34, 0.11, 0.13, 0.13, 0.13, 0.16], aligns=["l", "c", "c", "c", "c", "c"])
story.append(Spacer(1, 8))
story.append(t_met)
story.append(Paragraph("Tabela 3 — Métricas por configuração (10 editais computáveis; IC degenerado porque todos os ranks são 1 por empate).", st_caption))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "A leitura correta destes números é crítica. O rank 1 é tie-aware: a âncora empatada com centenas de "
    "candidatos conta como rank 1, e por isso o MRR é 1,0 e o intervalo de confiança degenera em [1,0; 1,0]. A "
    "métrica que revela a verdade é a AUC contra os rótulos: 0,52 — separação equivalente ao acaso. Em outras "
    "palavras: o motor não coloca o ganhador real abaixo de ninguém, mas também não o destaca. Isso não é um "
    "bug do motor: é o dado. Os resultados oficiais publicam nome, título, valor e situação; não publicam "
    "portfólio, trajetória nem resposta aos requisitos por candidato. Com esses perfis, qualquer função de "
    "pontuação razoável empata. A métrica secundária de consistência entre aprovados (os dois aprovados de "
    "maior valor contra os demais) dá 17 de 18 editais com as âncoras no topo — sinal de que o motor ordena "
    "bem quando há variância real nos perfis (editais com riqueza diferente).", st_body))
story.append(Spacer(1, 12))
img = Image(f"{HERE}/results/fig_auc_v3.png", width=AVAIL, height=AVAIL * 5.2 / 8.6)
story.append(KeepTogether([img, Paragraph("Figura 1 — AUC motor v4 contra AUC do diagnóstico TF-IDF, por edital computável.", st_caption)]))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "A figura contrasta o motor estruturado com a camada semântica como diagnóstico. Em pools pequenos "
    "(Solo do Outro, Aprendiz em Cena) ambos separam perfeitamente; nos grandes (Multilinguagens, com 639 "
    "suplentes), nenhum dos dois separa com os dados atuais. O FIDR mostra separação parcial via TF-IDF (0,56): "
    "títulos de espetáculos de dança carregam algum sinal. Este gráfico é o argumento para investir em "
    "descrições completas e embeddings — não em pesos.", st_body))

# ---- 6. Separacao dentro da linguagem
h1(story, "6. A separação dentro da mesma linguagem",
   "A pergunta que a v2 não respondeu: entre candidatos da mesma linguagem do edital, o motor distingue quem "
   "ganhou? Em 9 dos 9 editais com candidatos same-language, a âncora não fica abaixo de nenhum concorrente "
   "da mesma linguagem — mas em 8 deles isso ocorre por empate total de notas. O único edital em que um "
   "concorrente da mesma linguagem supera a âncora na nota é o Multilinguagens antes da correção semântica; "
   "com a correção any-of, todas as notas empatam de novo. Em termos práticos: a v3 prova que o motor não "
   "reprova injustamente dentro da linguagem (não há falso-negativo), mas também não seleciona dentro dela — "
   "e os rótulos mostram por quê: 1.202 pares rotulados com kappa de 0,20 entre avaliadores indicam que a "
   "rubrica estruturada e o texto plano divergem, ou seja, o sinal disponível publicamente é fraco e "
   "multidimensional. Pares fora da linguagem (rótulo 0 explícito, 110 pares) foram incluídos para provar que "
   "o motor não aprova por engano: nenhum artista fora da linguagem do edital recebeu nota acima de candidatos "
   "adverentes no mesmo edital.")

# ---- 7. Alpha e multi-obra
h1(story, "7. Varredura do alpha e portfólios multi-obra",
   "A fórmula do portfólio é R = α · melhor obra + (1 − α) · média das 3 melhores. A varredura em {0,0; 0,4; "
   "0,6; 0,8; 1,0} sobre o subconjunto multi-obra (Multilinguagens e FIDR, os dois editais cujo pool contém "
   "candidatos com duas a três obras) saiu plana: MRR 1,0 em todos os alphas, porque as obras de um mesmo "
   "perfil pontuam quase igual quando os requisitos do edital são só de linguagem. A discordância entre 'melhor "
   "obra' e 'média das 3 melhores' sobre quem fica na frente foi observada em 1 edital (Multilinguagens: "
   "Roberto Carlos Gomes de Sousa lidera pela melhor obra, a Nação do Maracatu Encanto do Pina pela média) — "
   "o mínimo pedido era 8; não atingido, porque só 3 artistas têm 3-6 obras com fonte pública e 5 têm 2 obras. "
   "O registro honesto do porquê: o agrupamento por nome nos PDFs é ruidoso (nomes quebrados em várias linhas) "
   "e os portfólios dos artistas não estão indexados pelos buscadores do ambiente.")
t_al = make_table(
    ["alpha", "MRR (subconjunto multi-obra)", "Hit@1"],
    [["0,0", "1,000", "2/2"], ["0,4", "1,000", "2/2"], ["0,6", "1,000", "2/2"],
     ["0,8", "1,000", "2/2"], ["1,0", "1,000", "2/2"]],
    [0.2, 0.45, 0.35], aligns=["c", "c", "c"])
story.append(Spacer(1, 8))
story.append(t_al)
story.append(Paragraph("Tabela 4 — Varredura do alpha: plana por empate de obras dentro do mesmo perfil.", st_caption))

# ---- 8. Casos
h1(story, "8. Casos de elegibilidade e do teto de 45",
   "Nove casos construídos sobre editais reais viram testes automatizados, todos passando: FAIL eliminatório "
   "bloqueia com nota alta (território, pessoa jurídica em regra de teste, tempo mínimo); UNKNOWN mostra "
   "pendente e não bloqueia nem ativa teto (território vazio, formação vazia, linguagem vazia); core casa só "
   "com núcleo — fotografia num edital de dança e dança só no suporte levam teto de 45; preference nunca ativa "
   "teto. As regras de teste marcadas com regra_teste=true (pessoa jurídica, formação, tempo mínimo) existem "
   "para provar a mecânica e não são atribuídas aos editais reais como requisitos publicados.")
t_cas = make_table(
    ["Caso", "Edital base", "Resultado esperado", "Status"],
    [["C1 território FAIL", "FIC Música 2024", "INELIGIBLE, bloqueado", "PASS"],
     ["C2 território UNKNOWN", "FIC Música 2024", "pendente, não bloqueia", "PASS"],
     ["C3 linguagem UNKNOWN", "FIC Artes Visuais 2024", "sem teto, fator None", "PASS"],
     ["C4 core FAIL (fotografia)", "29º FIDR 2026", "teto 45", "PASS"],
     ["C5 suporte não casa core", "29º FIDR 2026", "teto 45", "PASS"],
     ["C6 preference sem teto", "OBSERVA 3", "sem teto", "PASS"],
     ["C7 pessoa jurídica FAIL", "FIC Música 2024 (regra de teste)", "INELIGIBLE", "PASS"],
     ["C8 formação UNKNOWN", "Escola de Frevo (regra de teste)", "pendente", "PASS"],
     ["C9 tempo mínimo FAIL", "29º FIDR 2026 (regra de teste)", "INELIGIBLE", "PASS"]],
    [0.28, 0.30, 0.28, 0.14], aligns=["l", "l", "l", "c"])
story.append(Spacer(1, 8))
story.append(t_cas)
story.append(Paragraph("Tabela 5 — 9 casos executados pelo runner; entradas e saídas esperadas em casos_elegibilidade_teto.json.", st_caption))

# ---- 9. Calibração
h1(story, "9. Calibração no treino e avaliação no teste",
   "O split treino/teste foi registrado antes de qualquer métrica: 15 editais de treino e 8 de teste, "
   "estratificados por hash do id (md5(id) mod 3 = 0 vai para o teste). Treino: FIC 2024 audiovisual, cultura "
   "popular, teatro, artes visuais, circo, dança, artesanato, patrimônio, MIC audiovisual e MIC teatro, FIC "
   "2023 integradas e fotografia, Solo do Outro, OBSERVA 3 e FIDR. Teste: FIC 2024 música, literatura, "
   "fotografia e moda, Multilinguagens, Virado, Aprendiz em Cena e Escola de Frevo. A busca por coordenadas "
   "(multiplicadores 0,4 a 2,0, três varreduras) sobre o treino não moveu nenhum peso: o trace ficou vazio, "
   "e os pesos calibrados são idênticos à especificação (15/20/10/15/10/15/5/10). No teste, o MRR com os "
   "pesos calibrados é igual ao baseline (1,0). O leave-one-out dentro do treino, restrito aos editais "
   "computáveis (4 editais), mantém MRR 1,0. A razão de a calibração continuar plana mudou em relação à v2: "
   "na v2 os fatores eram neutros; na v3 as notas empatam — e um MRR de empate é insensível a qualquer peso. "
   "Nenhum fator está com variância suficiente para a calibração diferenciar; o caminho não é mexer nos "
   "pesos, é dar variância aos dados (descrições, requisitos preenchidos, trajetórias).")

# ---- 10. Contexto de trajetória
h1(story, "10. Contexto de trajetória (análise descritiva, fora do score)",
   "A v3 registra, sem usar no cálculo, os sinais de ponto de partida e alcance que os resultados oficiais "
   "publicam. Nos editais PNAB com cotas (Multilinguagens e Virado), o resultado publica autodeclarações: no "
   "Multilinguagens, 48% dos 155 selecionados se declararam pessoas negras contra 39% dos 639 suplentes, e "
   "5% dos selecionados se declararam pessoas com deficiência contra 0% dos suplentes; no Virado, 74% dos "
   "selecionados e 68% dos suplentes se declararam pessoas negras. Em Pernambuco, onde esses editais "
   "reservam recursos por grupos e cotas, a associação descritiva é de aderência ao público-alvo do edital — "
   "não há base para leitura causal, e quem não declarou não teve nada inferido. No OBSERVA 3, a imprensa "
   "documenta alcances distintos: Ana Neves estreou exposição individual; Geoneide Brandão traz pesquisa "
   "iniciada em 2020; Paulo Oliveira Quacula atua há mais de três décadas; Ícaro Galvão e Luciana Borre "
   "apresentam séries e livros próprios. No FIDR, o edital soma 2 pontos por autodeclaração (item 8.2) — "
   "mecanismo público de compensação que os dados podem monitorar em edições futuras. A trajetória 'partiu de "
   "menos e chegou longe' é observável no par Paulo Oliveira (30 anos, acervo consolidado) contra Ana Neves "
   "(primeira individual) dentro do mesmo edital — descrição, não pontuação.")

# ---- 11. Tamanhos vs mínimos
h1(story, "11. Tamanho final de cada parte contra o mínimo pedido",
   "Cada parte da v3 tem tamanho registrado e comparado ao mínimo do mandato — o que ficou abaixo do mínimo "
   "está marcado com a causa, sem preenchimento de lacunas com dados inventados.")
t_sz = make_table(
    ["Parte", "Mínimo", "Entregue", "Status"],
    [["Editais verificados (municipais, resultado oficial)", "20", "23", "atingido"],
     ["Pendentes com URL", "n/a", "6 (Olinda e Caruaru)", "registrado"],
     ["Pares âncora (≤2/edital)", "20", "44", "atingido"],
     ["Candidatos não-ganhadores", "n/a", "759 (de 1.038 candidaturas)", "atingido"],
     ["Artistas multilinguagem", "6", "10", "atingido"],
     ["Quase-acertos (mesma linguagem, não ganharam)", "8", "759 no pool (exigência coberta)", "atingido"],
     ["Artistas com 3-6 obras", "12", "3 (+5 com 2 obras)", "não atingido: portfólios públicos não indexados"],
     ["Editais com requisito além de linguagem", "8", "6", "não atingido: PDFs dos editais SIC/Aprendiz fora do ar"],
     ["Editais com discordância melhor-obra × média-3", "8", "1", "não atingido: portfólios multi-obra escassos"],
     ["Casos de elegibilidade/teto", "8", "9 (todos passando)", "atingido"]],
    [0.34, 0.10, 0.24, 0.32], aligns=["l", "c", "l", "l"])
story.append(Spacer(1, 8))
story.append(t_sz)
story.append(Paragraph("Tabela 6 — Tamanhos entregues contra mínimos do mandato, com causas das lacunas.", st_caption))

# ---- 12. Limitações e próximos passos
h1(story, "12. Limitações e próximos passos",
   "Quatro limitações delimitam as conclusões. Primeira: a separação ganhou-não-ganhou não é mensurável com "
   "perfis de resultados oficiais — os dados que a permitiriam (projetos completos, portfólios, respostas a "
   "requisitos) não são publicados; a AUC de 0,52 mede essa ausência, não um defeito do motor. Segunda: os 6 "
   "editais de Olinda e Caruaru seguem pendentes, com URL oficial registrada; o corpus é, na prática, "
   "municipal do Recife mais dois editais estaduais com sede no Recife. Terceira: o pool de concorrentes é "
   "o dos inscritos que o resultado publica (habilitados/suplentes/desclassificados); editais cujos "
   "resultados só publicam aprovados saem da métrica de separação. Quarta: os rótulos vêm de dois avaliadores "
   "automatizados (rubrica estruturada e TF-IDF), com kappa de 0,20 — concordância razoável-baixa que reflete "
   "a pobreza do sinal público; rótulos humanos substituiriam essa medida em uma próxima rodada.")
story.append(Paragraph(
   "Próximos passos, em ordem de retorno por esforço: (1) coletar os textos completos de inscrição ou "
   "justificativa dos projetos nos mapas culturais — é a única fonte que dá variância a conceito, técnica e "
   "posicionamento, destravando AUC e a calibração de pesos de verdade; (2) baixar os 6 resultados de Olinda "
   "e Caruaru nas URLs registradas e reexecutar o pipeline (aceita novos pares sem mudar código); (3) "
   "comparar TF-IDF contra embeddings (Voyage) sobre as descrições já capturadas — a infraestrutura está "
   "pronta no campo descricao de obras e editais; (4) portfólios públicos dos artistas com 2 obras (5 casos) "
   "para atingir os 12 multi-obra; (5) monitorar os editais com cotas (Multilinguagens, Virado, FIDR) por "
   "mais edições, para transformar a análise descritiva de contexto em série temporal.", st_body))

doc = TocDocTemplate(f"{HERE}/results/body_v3.pdf", pagesize=A4,
                     leftMargin=MARGIN, rightMargin=MARGIN,
                     topMargin=0.95 * inch, bottomMargin=0.85 * inch,
                     title="ArtistRank Benchmark v3 — dados reais",
                     author="Z.ai", creator="Z.ai",
                     subject="Ganhadores travados, candidatos reais e limites dos dados públicos")
doc.multiBuild(story, onFirstPage=on_page, onLaterPages=on_page)
print("ok body_v3:", f"{HERE}/results/body_v3.pdf")
