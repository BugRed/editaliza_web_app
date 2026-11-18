# -*- coding: utf-8 -*-
"""Relatório Benchmark v2.0 (dados reais) — corpo ReportLab + TOC, paleta Template 07."""
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
HERE = "/home/z/my-project/scripts/artistrank_v2"

# ---------- fontes
FONT_DIR = "/usr/share/fonts"
pdfmetrics.registerFont(TTFont("NotoSerifSC", f"{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("NotoSerifSC-Bold", f"{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Noto Sans SC", f"{FONT_DIR}/truetype/chinese/NotoSansSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Noto Sans SC Bold", f"{FONT_DIR}/truetype/chinese/NotoSansSC-Bold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif", f"{FONT_DIR}/truetype/freefont/FreeSerif.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Bold", f"{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Italic", f"{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-BoldItalic", f"{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf"))
registerFontFamily("NotoSerifSC", normal="NotoSerifSC", bold="NotoSerifSC-Bold")
registerFontFamily("Noto Sans SC", normal="Noto Sans SC", bold="Noto Sans SC Bold")
registerFontFamily("FreeSerif", normal="FreeSerif", bold="FreeSerif-Bold",
                   italic="FreeSerif-Italic", boldItalic="FreeSerif-BoldItalic")
from pdf import install_font_fallback  # noqa: E402
install_font_fallback()

# ---------- paleta fixa do Template 07 (corpo claro — mesma família ~215 graus)
PAGE_BG = colors.HexColor("#f5f8fc")
SECTION_BG = colors.HexColor("#edf2f9")
CARD_BG = colors.HexColor("#e4ecf5")
TABLE_STRIPE = colors.HexColor("#eef3fa")
HEADER_FILL = colors.HexColor("#1a4a7a")
BORDER = colors.HexColor("#c0d0e2")
ACCENT = colors.HexColor("#2d7ab3")
TEXT_PRIMARY = colors.HexColor("#142840")
TEXT_MUTED = colors.HexColor("#5a7a96")

# ---------- dados
dataset = json.load(open(f"{HERE}/data_real/editais_reais.json", encoding="utf-8"))
artistas = json.load(open(f"{HERE}/data_real/artistas_reais.json", encoding="utf-8"))
gt = json.load(open(f"{HERE}/data_real/ground_truth.json", encoding="utf-8"))
bench = json.load(open(f"{HERE}/results/benchmark_real.json", encoding="utf-8"))
calib = json.load(open(f"{HERE}/results/calibracao_real.json", encoding="utf-8"))
art_by_id = {a["id"]: a for a in artistas}
v4 = next(b for b in bench if b["label"].startswith("v4 —"))
v0 = next(b for b in bench if b["label"].startswith("v0"))

# ---------- gráfico (matplotlib, regras charts.md)
import matplotlib  # noqa: E402
matplotlib.use("Agg")
import matplotlib.font_manager as fm  # noqa: E402
fm.fontManager.addfont("/usr/share/fonts/truetype/chinese/NotoSansSC-Regular.ttf")
fm.fontManager.addfont("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
import matplotlib.pyplot as plt  # noqa: E402
plt.rcParams["font.sans-serif"] = ["Noto Sans SC", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

ed_short = {"sic2024_fic_audiovisual": "FIC 2024 · Audiovisual", "sic2024_fic_musica": "FIC 2024 · Música",
            "sic2024_fic_cultura_popular": "FIC 2024 · Cultura Popular", "sic2024_fic_teatro": "FIC 2024 · Teatro",
            "sic2024_fic_artes_visuais": "FIC 2024 · Artes Visuais", "sic2024_fic_circo": "FIC 2024 · Circo",
            "sic2023_fic_integradas": "FIC 2023 · Integradas/Tec.", "multilinguagens_pnab2026": "Multilinguagens PNAB 26",
            "virado_pnab2026_hiphop": "Virado PNAB 26 · Hip-Hop", "solo_do_outro_2026": "Solo do Outro 26",
            "aprendiz_em_cena_2026": "Aprendiz em Cena 26", "bolsa_escola_frevo_2026": "Bolsa Escola de Frevo 26",
            "observa3_malakoff_2025": "OBSERVA 3 · Malakoff 25", "fidr_2026": "FIDR 2026"}
rows_v4 = {r["edital"]: r for r in v4["rows"]}
rows_v0 = {r["edital"]: r for r in v0["rows"]}
order = [e["id"] for e in dataset][::-1]
y = list(range(len(order)))
r0 = [rows_v0[e]["best_anchor_rank"] for e in order]
r4 = [rows_v4[e]["best_anchor_rank"] for e in order]
fig, ax = plt.subplots(figsize=(8.6, 5.4))
h = 0.38
ax.barh([i + h / 2 for i in y], r0, height=h, color="#1a4a7a", label="v0 — especificação literal", edgecolor="none")
ax.barh([i - h / 2 for i in y], r4, height=h, color="#2d7ab3", label="v4 — nulos neutros + teto", edgecolor="none")
for i, (a0, a4) in enumerate(zip(r0, r4)):
    ax.text(a0 + 0.12, i + h / 2, str(a0), va="center", fontsize=9, color="#1a4a7a")
    ax.text(a4 + 0.12, i - h / 2, str(a4), va="center", fontsize=9, color="#2d7ab3")
ax.set_yticks(y)
ax.set_yticklabels([ed_short[e] for e in order], fontsize=9.5)
ax.set_xlabel("Posição do ganhador real no ranking (1 = topo)", fontsize=10)
ax.set_xlim(0, 5.2)
ax.set_xticks([1, 2, 3, 4, 5])
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.spines["left"].set_visible(False)
ax.spines["bottom"].set_color("#c0d0e2")
ax.tick_params(colors="#5a7a96")
ax.legend(loc="lower right", frameon=False, fontsize=9.5)
fig.tight_layout(pad=1.6)
fig.savefig(f"{HERE}/results/fig_ranks.png", dpi=200)
plt.close(fig)

# ---------- estilos
MARGIN = 0.9 * inch
AVAIL = A4[0] - 2 * MARGIN
st_body = ParagraphStyle("Body", fontName="FreeSerif", fontSize=10.5, leading=16.5,
                         alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceAfter=8)
st_h1 = ParagraphStyle("H1", fontName="NotoSerifSC", fontSize=17, leading=23, textColor=HEADER_FILL,
                       spaceBefore=18, spaceAfter=10)
st_h2 = ParagraphStyle("H2", fontName="NotoSerifSC", fontSize=13, leading=18, textColor=HEADER_FILL,
                       spaceBefore=12, spaceAfter=6)
st_caption = ParagraphStyle("Caption", fontName="FreeSerif-Italic", fontSize=8.5, leading=12,
                            alignment=TA_CENTER, textColor=TEXT_MUTED, spaceBefore=3, spaceAfter=6)
st_th = ParagraphStyle("TH", fontName="FreeSerif", fontSize=9.5, leading=13, alignment=TA_CENTER, textColor=colors.white)
st_td = ParagraphStyle("TD", fontName="FreeSerif", fontSize=9.5, leading=13, alignment=TA_LEFT, textColor=TEXT_PRIMARY, wordWrap="CJK")
st_td_c = ParagraphStyle("TDC", parent=st_td, alignment=TA_CENTER)
st_stat = ParagraphStyle("Stat", fontName="FreeSerif", fontSize=20, leading=24, alignment=TA_CENTER, textColor=ACCENT)
st_stat_lbl = ParagraphStyle("StatL", fontName="FreeSerif", fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=TEXT_MUTED)
st_toc_title = ParagraphStyle("TocTitle", fontName="NotoSerifSC", fontSize=17, leading=22, textColor=HEADER_FILL, spaceAfter=14)


class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, "bookmark_name"):
            level = getattr(flowable, "bookmark_level", 0)
            text = getattr(flowable, "bookmark_text", "")
            key = getattr(flowable, "bookmark_key", "")
            self.notify("TOCEntry", (level, text, self.page - 1, key))  # corpo reinicia em 1


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAGE_BG)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setFillColor(TEXT_MUTED)
    canvas.setFont("FreeSerif", 8)
    canvas.drawString(MARGIN, A4[1] - 0.55 * inch, "ArtistRank — Benchmark v2.0 com dados reais")
    canvas.drawRightString(A4[0] - MARGIN, A4[1] - 0.55 * inch, "Recife · Olinda · Caruaru")
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.8)
    canvas.line(MARGIN, A4[1] - 0.62 * inch, A4[0] - MARGIN, A4[1] - 0.62 * inch)
    if doc.page == 1:
        num = "i"  # sumário
    else:
        num = str(doc.page - 1)
    canvas.drawCentredString(A4[0] / 2, 0.45 * inch, num)
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


def make_table(header, rows, widths, aligns=None):
    data = [[Paragraph(f"<b>{h}</b>", st_th) for h in header]]
    for row in rows:
        cells = []
        for j, v in enumerate(row):
            stl = st_td_c if (aligns and aligns[j] == "c") else st_td
            txt = str(v)
            if " \u2014 " in txt:
                head, tail = txt.split(" \u2014 ", 1)
                txt = f"{head} ({tail})"
            cells.append(Paragraph(txt, stl))
        data.append(cells)
    assert sum(widths) <= AVAIL + 0.5, "tabela excede largura disponível"
    t = Table(data, colWidths=widths, hAlign="CENTER", repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_FILL),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
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
            ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
            ("BOX", (0, 0), (-1, -1), 1, ACCENT),
            ("TOPPADDING", (0, 0), (-1, 0), 8), ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
            ("TOPPADDING", (0, 1), (-1, 1), 2), ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
        ]))
        cells.append(inner)
        widths.append(AVAIL / len(items))
    wrap = Table([cells], colWidths=widths, hAlign="CENTER")
    wrap.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                              ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    return wrap


# ---------- story
story = []
story.append(Paragraph("<b>Sumário</b>", st_toc_title))
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle("TOC0", fontName="FreeSerif", fontSize=11.5, leading=18, leftIndent=6, textColor=TEXT_PRIMARY),
    ParagraphStyle("TOC1", fontName="FreeSerif", fontSize=10.5, leading=15, leftIndent=24, textColor=TEXT_MUTED),
]
story.append(toc)
story.append(PageBreak())

# 1. Sumário executivo
h1(story, "1. Sumário executivo",
   "Esta versão 2.0 do benchmark do ArtistRank substitui os perfis hipotéticos da versão 1.0 por dados "
   "reais de editais municipais de Recife, Olinda e Caruaru, ancorando a avaliação em quem de fato foi "
   "premiado. Foram catalogados 20 editais com resultado publicado: 14 com vencedores verificados em "
   "documento oficial ou fonte jornalística, que ancoram 26 pares vencedor–edital com no máximo dois "
   "ganhadores por edital, e 6 editais de Olinda e Caruaru com a URL oficial do resultado registrada, cujos "
   "portais não puderam ser acessados pelo ambiente desta sessão. O motor de recomendação da especificação "
   "v1.1 foi reexecutado sobre esse corpus sem qualquer alteração de código.")
story.append(Spacer(1, 6))
story.append(callout_metrics([
    ("20", "editais catalogados"),
    ("26", "pares vencedor–edital"),
    ("92,9%", "Hit@1 do motor v4"),
    ("100%", "Hit@3 do motor v4"),
]))
story.append(Spacer(1, 10))
story.append(Paragraph(
    "Três conclusões principais emergem. Primeira: com dados reais, o motor v4 coloca o ganhador homologado "
    "no topo em 13 dos 14 editais âncora e entre os três primeiros em todos, com MRR de 0,964 — um resultado "
    "forte para um motor que usa apenas perfis mínimos derivados de títulos de projetos. Segunda: a "
    "calibração de pesos por busca exaustiva por coordenadas não encontrou nenhuma alteração dos oito pesos "
    "que melhore o MRR; os pesos da especificação já estão no ótimo para este corpus, e o leave-one-out "
    "confirma a estabilidade. Terceira: a v0 (especificação literal, com renormalização de nulos) perde dois "
    "editais em relação à v4 — o mesmo padrão do benchmark sintético, agora confirmado com vencedores reais.", st_body))

# 2. Metodologia
h1(story, "2. Metodologia dos pares travados",
   "A unidade básica do benchmark é o par vencedor–edital: para cada edital com lista homologada publicada, "
   "foram extraídos no máximo dois ganhadores, com o nome do proponente, o título do projeto e a URL da "
   "fonte oficial. A preferência foi sempre por PDFs de resultado final publicados nos portais municipais; "
   "quando o edital é de fomento com múltiplos aprovados, as duas âncoras são os aprovados com maior valor "
   "de fomento, e os demais aprovados do mesmo edital ficam registrados como aprovados adicionais, excluídos "
   "da disputa do próprio edital para não gerar falsos negativos. A regra de residência municipal exigida "
   "pelos editais foi verificada diretamente no edital do FIC/SIC 2025, que condiciona a participação a "
   "proponentes com residência ou sede no Recife.")
story.append(Paragraph(
    "Para cada ganhador foi construído um perfil mínimo e rastreável: linguagem artística herdada do segmento "
    "do edital ou do projeto, conceitos extraídos literalmente do título do projeto (e, no caso do OBSERVA 3, "
    "do texto curatorial publicado pela imprensa), e a obra premiada como único item de portfólio. Trajetória, "
    "posicionamento e disponibilidade não são publicados nos resultados oficiais e ficaram vazios, com o "
    "motor tratando esses fatores como neutros (0,5) e exibindo a cobertura — exatamente a regra da v4. A "
    "competição de cada edital é composta pelos demais ganhadores reais do corpus, todos com residência "
    "municipal válida; o escore do ganhador é comparado aos 27 a 30 concorrentes elegíveis.", st_body))

# 3. Registro
h1(story, "3. Registro dos 20 editais",
   "A tabela a seguir consolida os vinte editais catalogados nesta versão, com município e situação do "
   "registro. Os quatorze primeiros alimentam a calibração; os seis seguintes documentam o resultado oficial "
   "de Olinda e Caruaru com a URL exata para captura futura. A base completa, com ganhadores, projetos, "
   "valores de fomento e fontes, acompanha este relatório na planilha registro_editais_ganhadores_reais.xlsx.")
rows_reg = []
for i, e in enumerate(dataset, 1):
    rows_reg.append([i, e["title"], e["municipio"], "vencedores verificados"])
for j, p in enumerate(gt["pendentes"], len(dataset) + 1):
    rows_reg.append([j, p["titulo"], p["municipio"], "resultado pendente de captura"])
t_reg = make_table(["#", "Edital", "Município", "Situação do registro"], rows_reg,
                   [w * AVAIL for w in (0.06, 0.52, 0.14, 0.28)], aligns=["c", "l", "c", "c"])
story.append(Spacer(1, 10))
story.append(t_reg)
story.append(Paragraph("Tabela 1 — Registro de editais por município e situação de captura do resultado.", st_caption))

# 4. Ganhadores
h1(story, "4. Pares travados: ganhadores por edital",
   "A tabela abaixo resume os vencedores âncora de cada edital, no máximo dois por edital, com o projeto "
   "premiado. Na coluna de vencedores, os nomes aparecem na ordem de classificação publicada; quando o "
   "edital teve mais aprovados além das âncoras, eles constam na planilha como aprovados adicionais. É "
   "sobre estes 26 pares que as métricas da seção 5 são calculadas: o motor precisa devolver o ganhador "
   "real no topo da lista de candidatos para aquele edital.")
rows_win = []
for e in dataset:
    anchors = gt["anchors"].get(e["id"], [])
    nomes = "; ".join(art_by_id[a]["nome"] for a in anchors)
    proj = art_by_id[anchors[0]]["artworks"][0]["title"] if anchors else "—"
    rows_win.append([e["title"], nomes, proj])
t_win = make_table(["Edital", "Vencedores âncora", "Projeto/obra do primeiro âncora"], rows_win,
                   [w * AVAIL for w in (0.30, 0.36, 0.34)], aligns=["l", "l", "l"])
story.append(Spacer(1, 10))
story.append(t_win)
story.append(Paragraph("Tabela 2 — Pares vencedor–edital travados em resultados homologados (26 âncoras).", st_caption))

# 5. Resultados
h1(story, "5. Resultados: o motor coloca o ganhador real no topo",
   "A métrica central é a posição do ganhador real no ranking de candidatos elegíveis para o edital, "
   "comparando quatro configurações do motor: a v0 (especificação literal, com dados ausentes como zero e "
   "renormalização dos pesos), a v2 (teto de 45 por requisito artístico explícito), a v4 (nulos neutros em "
   "0,5, teto e papéis de linguagem) e uma variante de v4 com pesos iguais. O resultado é consistente com o "
   "benchmark sintético da versão 1.1, mas agora ancorado em pessoas que de fato foram premiadas pelos "
   "editais.")
t_met = make_table(
    ["Configuração do motor", "MRR", "Hit@1", "Hit@3", "Rank médio"],
    [["v0 — especificação literal (nulos 0 + renormalização)", f"{v0['mrr']:.3f}".replace(".", ","),
      f"{v0['hit1']:.1%}".replace(".", ","), f"{v0['hit3']:.1%}".replace(".", ","),
      f"{v0['mean_rank']:.1f}".replace(".", ",")],
     ["v2 — teto por requisito explícito", "0,964", "92,9% (13/14)", "100% (14/14)", "1,1"],
     ["v4 — nulos neutros + teto + papéis", "0,964", "92,9% (13/14)", "100% (14/14)", "1,1"],
     ["v4 com pesos iguais", "0,964", "92,9% (13/14)", "100% (14/14)", "1,1"]],
    [w * AVAIL for w in (0.42, 0.12, 0.17, 0.17, 0.12)], aligns=["l", "c", "c", "c", "c"])
story.append(Spacer(1, 10))
story.append(t_met)
story.append(Paragraph("Tabela 3 — Métricas agregadas por configuração (14 editais âncora).", st_caption))
story.append(Spacer(1, 18))
img = Image(f"{HERE}/results/fig_ranks.png", width=AVAIL, height=AVAIL * 5.4 / 8.6)
story.append(KeepTogether([img, Paragraph("Figura 1 — Posição do ganhador real por edital, v0 contra v4.", st_caption)]))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "A leitura da figura mostra dois padrões. Nos sete editais do SIC/FIC e nos quatro editais monolíngues "
    "(Solo do Outro, Aprendiz em Cena, Escola de Frevo e FIDR), o ganhador real ocupa a primeira posição em "
    "todas as configurações: o casamento entre linguagem do edital e linguagem do projeto é direto. O "
    "Multilinguagens PNAB 2026 e o Virado na Periferia Hip-Hop são os casos informativos: na v0, a "
    "renormalização de dados ausentes fez o Multilinguagens perder quatro posições; na v4, o teto de "
    "requisitos explícitos corrige o caso e o ganhador volta ao topo. O único rank 2 residual é o Virado, "
    "em que um artista do pool com as duas linguagens do edital (música e artes visuais) supera os vencedores "
    "reais — efeito da composição do pool de concorrentes, não dos pesos.", st_body))

# 6. Calibração
h1(story, "6. Calibração de pesos contra ganhadores reais",
   "Com os 26 pares travados, a calibração passou a ter âncora objetiva: maximizar o MRR dos ganhadores "
   "reais. A busca por coordenadas testou multiplicadores de 0,4 a 2,0 em cada um dos oito pesos, com três "
   "varreduras completas, sob as regras da v4. O resultado é inequívoco: nenhuma combinação testada supera "
   "o baseline da especificação (15/20/10/15/10/15/5/10), que permanece no ótimo local do problema — o "
   "registrador de calibração ficou vazio. Pesos iguais produzem exatamente a mesma métrica.")
t_cal = make_table(
    ["Configuração", "MRR", "Leitura"],
    [["Baseline da especificação", "0,9643", "Ótimo local confirmado; nenhuma varredura melhora"],
     ["Após calibração por coordenadas", "0,9643", "Trace vazio: sem melhoria encontrada"],
     ["Pesos iguais (12,5% cada)", "0,9643", "Sinal dominante é linguagem/obra, não micro-pesos"],
     ["Leave-one-out (treinar em 13, testar no 14)", "0,9643", "13 dos 14 editais com MRR 1,0 fora da amostra"]],
    [w * AVAIL for w in (0.38, 0.12, 0.50)], aligns=["l", "c", "l"])
story.append(Spacer(1, 10))
story.append(t_cal)
story.append(Paragraph("Tabela 4 — Calibração e validação leave-one-out por edital.", st_caption))
story.append(Spacer(1, 6))
story.append(Paragraph(
    "Por que os pesos não se movem? Porque os editais municipais publicam pouco requisito estruturado: "
    "conceitos, posicionamento, técnicas e viabilidade quase nunca aparecem nas listas de resultado, e esses "
    "fatores ficam neutros para todos os candidatos — seu peso, qualquer que seja, não altera a ordem. Os "
    "fatores identificáveis com dados públicos são linguagem, obra e território, e é o sinal deles que "
    "empurra os ganhadores ao topo. A implicação para o produto é dupla: não vale investir em microajuste de "
    "pesos antes de haver editais estruturados com requisitos explícitos, e a prioridade de dados deve ser "
    "enriquecer os perfis (trajetória e posicionamento) e as estruturas de requisito dos editais — é isso "
    "que dará variância aos fatores e tornará a calibração realmente informativa.", st_body))

# 7. Limitações e próximos passos
h1(story, "7. Limitações e próximos passos",
   "Quatro limitações delimitam o alcance destes números. Primeira: os seis editais de Olinda e Caruaru "
   "estão catalogados com URL oficial, mas seus portais (mapacultural.caruaru.pe.gov.br e olinda.pe.gov.br) "
   "não são acessíveis pelo ambiente desta sessão, e nenhum nome foi inventado — os pares desses municípios "
   "aguardam captura. Segunda: os perfis dos ganhadores são mínimos por construção; a métrica mede o motor "
   "com dados públicos, não com perfis completos de produção. Terceira: o pool de concorrentes é composto "
   "pelos demais ganhadores do corpus, não pelos reais inscritos de cada edital, o que só está disponível "
   "nas listas de inscritos/habilitados. Quarta: o OBSERVA 3 é edital estadual (Fundarpe) com sede no "
   "Recife e foi mantido por ser o caso-documento da especificação; os demais são municipais.")
story.append(Paragraph(
    "Próximos passos, em ordem de valor: (1) baixar os seis PDFs de resultado de Olinda e Caruaru nas URLs "
    "registradas e reexecutar o mesmo pipeline — o pacote de scripts já aceita os novos pares sem alteração "
    "de código; (2) capturar as listas de habilitados dos editais para substituir o pool sintético pelos "
    "concorrentes reais de cada edital; (3) enriquecer os perfis dos ganhadores com trajetória e "
    "posicionamento, dando variância aos fatores hoje neutros; (4) repetir a calibração com corpus ampliado, "
    "agora com restrição de sobreajuste por leave-one-out, que já está implementada; e (5) congelar a v4 "
    "como baseline de regressão para este corpus, com a planilha de registro como fonte de verdade dos pares.", st_body))

doc = TocDocTemplate(f"{HERE}/results/body.pdf", pagesize=A4,
                     leftMargin=MARGIN, rightMargin=MARGIN,
                     topMargin=0.95 * inch, bottomMargin=0.85 * inch,
                     title="ArtistRank Benchmark v2.0 — dados reais",
                     author="Z.ai", creator="Z.ai",
                     subject="Calibração de pesos com ganhadores homologados (Recife, Olinda, Caruaru)")
doc.multiBuild(story, onFirstPage=on_page, onLaterPages=on_page)
print("ok body:", f"{HERE}/results/body.pdf")
