# -*- coding: utf-8 -*-
"""Gráficos do benchmark ArtistRank — dados reais dos experimentos."""
import csv
import json
import os

import matplotlib
import matplotlib.font_manager as fm
import numpy as np

fm.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
import matplotlib.pyplot as plt

plt.rcParams.update({
    'font.sans-serif': ['DejaVu Sans'], 'axes.unicode_minus': False,
    'figure.facecolor': '#FFFFFF', 'axes.facecolor': '#FFFFFF',
    'axes.edgecolor': '#E5E7EB', 'axes.linewidth': 0.8,
    'axes.spines.top': False, 'axes.spines.right': False,
    'axes.grid': False,
    'xtick.major.size': 0, 'ytick.major.size': 0,
    'xtick.labelsize': 9, 'ytick.labelsize': 9,
    'axes.labelsize': 10, 'axes.titlesize': 15, 'axes.titleweight': 'bold',
    'axes.titlepad': 14, 'legend.frameon': False, 'legend.fontsize': 9,
    'figure.dpi': 200, 'savefig.dpi': 200, 'savefig.bbox': 'tight',
    'savefig.facecolor': '#FFFFFF', 'savefig.pad_inches': 0.3,
})

C_BLUE, C_CYAN, C_AMBER, C_RED, C_GREEN = '#4C6EF5', '#3AAFA9', '#C6866A', '#CC3311', '#009988'
G900, G700, G500, G400, G300, G200 = '#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'

RES = "/home/z/my-project/download/artistrank/results"
FIG = os.path.join(RES, "figs")
os.makedirs(FIG, exist_ok=True)

metrics = json.load(open(os.path.join(RES, "metrics_summary.json"), encoding="utf-8"))
sens = json.load(open(os.path.join(RES, "sensitivity.json"), encoding="utf-8"))
sat = json.load(open(os.path.join(RES, "saturation.json"), encoding="utf-8"))
sat4 = json.load(open(os.path.join(RES, "saturation_v4.json"), encoding="utf-8"))
cases = json.load(open(os.path.join(RES, "cases_por_versao.json"), encoding="utf-8"))
proj = json.load(open(os.path.join(RES, "projecao_competitiva_malakoff.json"), encoding="utf-8"))


def clean_axis(ax, grid=True):
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    if grid:
        ax.yaxis.grid(True, alpha=0.08, color=G300)
        ax.set_axisbelow(True)


def save(fig, path):
    fig.savefig(path, dpi=200, facecolor='white', bbox_inches='tight')
    plt.close(fig)
    print(f'ok {path} ({os.path.getsize(path)/1024:.0f}KB)')


# ------------------------------------------------ 1. métricas (2x2)
NAMES = {"random": "aleatório", "language_only": "só linguagem", "tfidf_full": "só palavras-chave",
         "userC_formula": "fórmula C (confiança)", "v0_spec_literal": "v0 (spec literal)",
         "v3_cap_papeis_linguagem": "v3 (cap+papéis)", "v4_cap_papeis_neutral": "v4 (cap+papéis+nulos neutros)",
         "v2_cap_requisitos": "v2 (cap)", "equal_v4_com_cap": "v4 pesos iguais"}
SHOW = ["random", "tfidf_full", "language_only", "userC_formula", "v0_spec_literal", "v3_cap_papeis_linguagem"]
MKEYS = [("spearman", "Correlação com a avaliação humana (Spearman)"),
         ("auc", "Separação relevante/irrelevante (AUC)"),
         ("precision_at3", "Precisão das 3 primeiras recomendações (P@3)"),
         ("ndcg_at5", "Qualidade da ordem do ranking (NDCG@5)")]
fig = plt.figure(figsize=(15, 10.5), constrained_layout=True)
gs = fig.add_gridspec(2, 2, wspace=0.32, hspace=0.42)
for gi, (mk, mtitle) in enumerate(MKEYS):
    ax = fig.add_subplot(gs[gi // 2, gi % 2])
    vals = [next(m[mk] for m in metrics if m["model"] == n) for n in SHOW]
    names = [NAMES[n] for n in SHOW]
    colors = [G300 if n in ("aleatório", "fórmula C (confiança)") else (G200 if "só" in n else C_BLUE) for n in names]
    colors[-1] = C_BLUE
    order = np.argsort(vals)
    y = np.arange(len(SHOW))
    ax.barh(y, [vals[i] for i in order], color=[colors[i] for i in order], height=0.62, zorder=3)
    ax.set_yticks(y)
    ax.set_yticklabels([names[i] for i in order])
    for i, vi in enumerate(order):
        ax.text(vals[vi] + 0.012, i, f"{vals[vi]:.3f}", va='center', fontsize=9,
                color=G900 if names[vi] == "v3 (cap+papéis)" else G500)
    ax.set_xlim(0, 1.13)
    ax.xaxis.set_visible(False)
    ax.spines['bottom'].set_visible(False)
    ax.set_title(mtitle, loc='left', fontsize=12.5)
fig.suptitle("O motor híbrido separa bons candidatos de ruins; a fórmula C sozinha não separa nada",
             fontsize=16, fontweight='bold', y=1.03)
save(fig, os.path.join(FIG, "fig1_metricas.png"))

# ------------------------------------------------ 2. heatmap v4
rows, cols, mat, mask = [], [], [], []
with open(os.path.join(RES, "score_matrix_v4.csv"), encoding="utf-8") as f:
    rd = list(csv.reader(f))
cols = rd[0][1:]
for r in rd[1:]:
    rows.append(r[0])
    row = [float(x) if x else np.nan for x in r[1:]]
    mat.append(row)
mat = np.array(mat)
fig, ax = plt.subplots(figsize=(13.5, 8.2), constrained_layout=True)
masked = np.ma.masked_invalid(mat)
from matplotlib.colors import LinearSegmentedColormap
cmap = LinearSegmentedColormap.from_list('bc', ['#FFFFFF', C_BLUE])
cmap.set_bad(color='#F1F5F9')
im = ax.imshow(masked, cmap=cmap, aspect='auto', vmin=0, vmax=90)
for i in range(len(rows)):
    for j in range(len(cols)):
        if np.isnan(mat[i, j]):
            ax.text(j, i, "—", ha='center', va='center', fontsize=8.5, color=G400)
        else:
            v = mat[i, j]
            ax.text(j, i, f"{v:.0f}", ha='center', va='center', fontsize=8.5,
                    color='white' if v > 55 else G700)
ax.set_xticks(range(len(cols)))
ax.set_xticklabels([c.replace('_', ' ') for c in cols], rotation=28, ha='right', fontsize=8.5)
ax.set_yticks(range(len(rows)))
ax.set_yticklabels([r.replace('_', ' ') for r in rows], fontsize=8.5)
ax.set_title("Matriz de compatibilidade v4 (0–100): território/categoria bloqueiam pares (—)", loc='left', pad=14)
cbar = fig.colorbar(im, ax=ax, fraction=0.03, pad=0.06, shrink=0.8)
cbar.outline.set_visible(False)
cbar.ax.tick_params(labelsize=8)
for spine in ax.spines.values():
    spine.set_visible(True)
    spine.set_color(G200)
save(fig, os.path.join(FIG, "fig2_matriz.png"))

# ------------------------------------------------ 3. distribuição v4
labels_gt = json.load(open("/home/z/my-project/download/artistrank/data/ground_truth.json", encoding="utf-8"))["labels"]
vals_all = [v for r in rd[1:] for v in [float(x) if x else None for x in r[1:]] if v is not None]
fig, ax = plt.subplots(figsize=(11, 6), constrained_layout=True)
bins = np.arange(20, 95, 5)
ax.hist(vals_all, bins=bins, color=G300, edgecolor='white', linewidth=0.6, zorder=3, label='todos os pares elegíveis')
pos = [v for r in rd[1:] for i, v in enumerate([float(x) if x else None for x in r[1:]])
       if v is not None and labels_gt[rows[0]][cols[0]] is not None]  # placeholder
# marca os pares com rótulo >= 2
pos_pairs = []
with open(os.path.join(RES, "score_matrix_v4.csv"), encoding="utf-8") as f:
    rd2 = list(csv.reader(f))
for r in rd2[1:]:
    aid = r[0]
    for j, x in enumerate(r[1:]):
        if x and labels_gt[aid][cols[j]] >= 2:
            pos_pairs.append(float(x))
ax.hist(pos_pairs, bins=bins, color=C_BLUE, edgecolor='white', linewidth=0.6, zorder=4,
        alpha=0.95, label='pares de alta aderência (rótulo ≥ 2)')
mean_v = float(np.mean(vals_all))
std_v = float(np.std(vals_all))
ax.axvline(mean_v, color=G500, linestyle='--', linewidth=1.2)
ax.text(mean_v + 1, ax.get_ylim()[1] * 0.92, f"média {mean_v:.0f}\ndesvio {std_v:.0f}", fontsize=9, color=G700)
ax.set_title("Distribuição dos scores v4: não satura — pares relevantes se concentram acima", loc='left')
ax.set_xlabel("compatibilidade (0–100)")
ax.legend(loc='upper left', bbox_to_anchor=(0.02, 1.0))
clean_axis(ax)
save(fig, os.path.join(FIG, "fig3_distribuicao.png"))

# ------------------------------------------------ 4. sensibilidade
items = [(k, v) for k, v in sens.items() if k != "equal_vs_spec"]
items.sort(key=lambda t: t[1])
fig, ax = plt.subplots(figsize=(11, 7), constrained_layout=True)
y = np.arange(len(items))
vals = [v for _, v in items]
labs = [k.replace("+0.05", " (+)").replace("-0.05", " (−)") for k, _ in items]
ax.barh(y, vals, color=C_BLUE, height=0.6, zorder=3)
eq = sens["equal_vs_spec"]
ax.axvline(1.0, color=G700, linewidth=1.2, linestyle='--')
ax.axvline(eq, color=C_AMBER, linewidth=1.8)
ax.text(eq + 0.004, 5.2, f"pesos todos iguais\ntau = {eq:.2f}".replace(".", ","), fontsize=10,
        color='#8A5A44', va='center', ha='left',
        bbox=dict(boxstyle='round,pad=0.35', facecolor='#FFF7ED', edgecolor=C_AMBER, linewidth=0.8))
ax.set_yticks(y)
ax.set_yticklabels(labs, fontsize=8.5)
ax.set_xlim(0.855, 1.004)
ax.set_title("Perturbar um peso em ±0,05 quase não muda o ranking (tau ≥ 0,95);\nzerar as diferenças de peso muda mais", loc='left', fontsize=13)
ax.xaxis.grid(True, alpha=0.08, color=G300)
ax.set_axisbelow(True)
save(fig, os.path.join(FIG, "fig4_sensibilidade.png"))

# ------------------------------------------------ 5. casos por versão
sel = ["ana_foto_memoria × festival_danca_2026", "beto_iniciante × malakoff_observa4",
       "ana_foto_memoria × malakoff_observa4", "dj_grafite × virado_periferia_2026"]
cmap_v = {"v0": G300, "v2": '#8FA6D9', "v3": C_BLUE, "v4": '#1E2E5C'}
fig, ax = plt.subplots(figsize=(12.5, 6.5), constrained_layout=True)
x = np.arange(len(sel))
w = 0.2
for i, v in enumerate(["v0", "v2", "v3", "v4"]):
    vals = []
    for s in sel:
        row = next(c for c in cases if f"{c['artist']} × {c['edital']}" == s)
        sc = row["scores"][v]
        vals.append(0 if sc == "INELIG" else sc)
    ax.bar(x + (i - 1.5) * w, vals, width=w * 0.9, color=cmap_v[v], label=v, zorder=3,
           edgecolor='white', linewidth=0.4)
    for xi, val in zip(x + (i - 1.5) * w, vals):
        ax.text(xi, val + 1.5, f"{val:.0f}", ha='center', fontsize=8, color=G500)
ax.set_xticks(x)
ax.set_xticklabels(["Ana × Festival de Dança\n(fotógrafa fora do núcleo — rótulo 1)",
                    "Beto × Malakoff\n(iniciante — rótulo 1)",
                    "Ana × Malakoff\n(aderência forte — rótulo 3)",
                    "DJ Grafitte × Virado\n(aderência forte — rótulo 3)"], fontsize=9)
ax.set_ylim(0, 100)
ax.set_ylabel("compatibilidade (0–100)")
ax.legend(loc='upper left', bbox_to_anchor=(0.01, 1.02), ncol=4)
ax.set_title("As correções derrubam falsos positivos sem tocar nos verdadeiros", loc='left')
clean_axis(ax)
save(fig, os.path.join(FIG, "fig5_casos.png"))

# ------------------------------------------------ 6. projeção competitiva Malakoff
crits = ["trajetoria", "qualidade_conceitual", "viabilidade", "originalidade_ineditismo",
         "clareza_apresentacao", "diversidade_acesso", "acessibilidade"]
crit_labs = ["Trajetória\n(4)", "Qualidade\nconceitual (4)", "Viabilidade\n(4)", "Originalidade\n(4)",
             "Clareza\n(4)", "Diversidade\n(4)", "Acessibilidade\n(2)"]
people = [("ana_foto_memoria", "Ana (12 anos de carreira)", C_BLUE),
          ("marina_multimidia", "Marina (instalação multimídia)", C_CYAN),
          ("beto_iniciante", "Beto (2 anos, início de carreira)", C_AMBER)]
fig, ax = plt.subplots(figsize=(13, 6.5), constrained_layout=True)
x = np.arange(len(crits))
n = len(people)
w = 0.75 / n
for i, (pid, plab, col) in enumerate(people):
    vals = [proj[pid][c] for c in crits]
    ax.bar(x + (i - n / 2 + 0.5) * w, vals, width=w * 0.88, color=col, label=plab, zorder=3,
           edgecolor='white', linewidth=0.4)
totals = [proj[pid]["total"] for pid, _, _ in people]
compat = [proj[pid]["compatibilidade_v4"] for pid, _, _ in people]
for i, (pid, plab, col) in enumerate(people):
    ax.text(6.55, proj[pid]["acessibilidade"] + 0.12, f"", fontsize=8)
ax.set_xticks(x)
ax.set_xticklabels(crit_labs, fontsize=9)
ax.set_ylim(0, 5.6)
ax.set_title("Projeção nos critérios oficiais do edital Malakoff (26 pts): a compatibilidade pura inverte a ordem real", loc='left')
ax.text(6.62, 3.6, f"TOTAIS (de 26)\nAna: {totals[0]}  ·  Marina: {totals[1]}  ·  Beto: {totals[2]}\n\n"
                   f"Compatibilidade v4\nAna: {compat[0]}  ·  Marina: {compat[1]}  ·  Beto: {compat[2]}",
        fontsize=9.5, color=G700, va='center',
        bbox=dict(boxstyle='round,pad=0.5', facecolor='#F8FAFC', edgecolor=G200))
ax.legend(loc='upper right', bbox_to_anchor=(0.99, 1.02))
clean_axis(ax)
ax.set_xlim(-0.6, 8.2)
save(fig, os.path.join(FIG, "fig6_competitiva.png"))

print("figuras salvas em", FIG)
