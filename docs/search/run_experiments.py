# -*- coding: utf-8 -*-
"""
Benchmark do ArtistRank v0: rodar matriz de scores, baselines e métricas.

Rubrica de rótulos (referência de especialista, documentada):
- 3 = aderência forte: artista é claramente do público-alvo, candidato competitivo
- 2 = aderência boa: aplicável e plausível, mas não é o alvo central
- 1 = aderência marginal: encaixe parcial, candidatura improvável
- 0 = sem aderência / ineligível: não faz sentido aplicar
- Par INELIGIBLE recebe rótulo 0 e é excluído das métricas de ranking.
"""
import csv
import json
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dataset_editais import EDITAIS, METADATA_30
from dataset_artistas import ARTISTAS
import engine
from engine import TfidfIndex, artist_flat_text, edital_flat_text, rank_artist_edital, score_language, lang_match

OUT = "/home/z/my-project/download/artistrank"
DATA = os.path.join(OUT, "data")
RES = os.path.join(OUT, "results")
os.makedirs(DATA, exist_ok=True)
os.makedirs(RES, exist_ok=True)

GROUND_TRUTH = {
    "ana_foto_memoria": {"malakoff_observa4": 3, "spa_2026": 3, "festival_danca_2026": 1, "virado_periferia_2026": 0, "letra_e_voz_2026": 0, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 0, "mostra_circo_2026": 0, "sao_joao_2026": 0, "fic_2025": 2, "joel_datz": 2, "formacao_tecnica_2026": 1},
    "mestre_bituca": {"malakoff_observa4": 1, "spa_2026": 0, "festival_danca_2026": 1, "virado_periferia_2026": 0, "letra_e_voz_2026": 0, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 0, "mostra_circo_2026": 0, "sao_joao_2026": 3, "fic_2025": 0, "joel_datz": 2, "formacao_tecnica_2026": 0},
    "dj_grafite": {"malakoff_observa4": 2, "spa_2026": 3, "festival_danca_2026": 0, "virado_periferia_2026": 3, "letra_e_voz_2026": 0, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 0, "mostra_circo_2026": 0, "sao_joao_2026": 0, "fic_2025": 2, "joel_datz": 1, "formacao_tecnica_2026": 1},
    "cia_duo_cenico": {"malakoff_observa4": 0, "spa_2026": 0, "festival_danca_2026": 1, "virado_periferia_2026": 1, "letra_e_voz_2026": 0, "aprendiz_em_cena_2026": 3, "solo_do_outro_2026": 0, "mostra_circo_2026": 0, "sao_joao_2026": 0, "fic_2025": 3, "joel_datz": 0, "formacao_tecnica_2026": 2},
    "lucia_faro": {"malakoff_observa4": 0, "spa_2026": 0, "festival_danca_2026": 3, "virado_periferia_2026": 0, "letra_e_voz_2026": 0, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 3, "mostra_circo_2026": 0, "sao_joao_2026": 2, "fic_2025": 2, "joel_datz": 0, "formacao_tecnica_2026": 2},
    "theo_palhaco": {"malakoff_observa4": 0, "spa_2026": 0, "festival_danca_2026": 0, "virado_periferia_2026": 1, "letra_e_voz_2026": 0, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 0, "mostra_circo_2026": 3, "sao_joao_2026": 1, "fic_2025": 2, "joel_datz": 0, "formacao_tecnica_2026": 2},
    "rosa_cordel": {"malakoff_observa4": 2, "spa_2026": 2, "festival_danca_2026": 0, "virado_periferia_2026": 1, "letra_e_voz_2026": 3, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 0, "mostra_circo_2026": 0, "sao_joao_2026": 1, "fic_2025": 2, "joel_datz": 2, "formacao_tecnica_2026": 2},
    "vinicius_doc": {"malakoff_observa4": 0, "spa_2026": 0, "festival_danca_2026": 0, "virado_periferia_2026": 3, "letra_e_voz_2026": 0, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 0, "mostra_circo_2026": 0, "sao_joao_2026": 0, "fic_2025": 2, "joel_datz": 0, "formacao_tecnica_2026": 1},
    "marina_multimidia": {"malakoff_observa4": 3, "spa_2026": 3, "festival_danca_2026": 0, "virado_periferia_2026": 0, "letra_e_voz_2026": 0, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 0, "mostra_circo_2026": 0, "sao_joao_2026": 0, "fic_2025": 2, "joel_datz": 1, "formacao_tecnica_2026": 1},
    "paula_formadora": {"malakoff_observa4": 1, "spa_2026": 2, "festival_danca_2026": 0, "virado_periferia_2026": 0, "letra_e_voz_2026": 1, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 0, "mostra_circo_2026": 0, "sao_joao_2026": 0, "fic_2025": 2, "joel_datz": 1, "formacao_tecnica_2026": 3},
    "seu_ze_artesao": {"malakoff_observa4": 1, "spa_2026": 0, "festival_danca_2026": 0, "virado_periferia_2026": 0, "letra_e_voz_2026": 0, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 0, "mostra_circo_2026": 0, "sao_joao_2026": 1, "fic_2025": 0, "joel_datz": 3, "formacao_tecnica_2026": 0},
    "beto_iniciante": {"malakoff_observa4": 1, "spa_2026": 1, "festival_danca_2026": 0, "virado_periferia_2026": 0, "letra_e_voz_2026": 1, "aprendiz_em_cena_2026": 0, "solo_do_outro_2026": 0, "mostra_circo_2026": 0, "sao_joao_2026": 0, "fic_2025": 1, "joel_datz": 1, "formacao_tecnica_2026": 0},
}


# ------------------------------------------------------ métricas

def _rankdata(xs):
    """Ranks com empates = média das posições (1-based)."""
    order = sorted(range(len(xs)), key=lambda i: xs[i])
    ranks = [0.0] * len(xs)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and xs[order[j + 1]] == xs[order[i]]:
            j += 1
        avg = (i + j) / 2 + 1
        for k in range(i, j + 1):
            ranks[order[k]] = avg
        i = j + 1
    return ranks


def spearman(x, y):
    if len(x) < 2:
        return None
    rx, ry = _rankdata(x), _rankdata(y)
    n = len(x)
    mx, my = sum(rx) / n, sum(ry) / n
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    den = math.sqrt(sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry))
    return num / den if den else 0.0


def kendall_tau(a, b):
    n = len(a)
    conc = disc = 0
    for i in range(n):
        for j in range(i + 1, n):
            s = (a[i] - a[j]) * (b[i] - b[j])
            if s > 0:
                conc += 1
            elif s < 0:
                disc += 1
    d = conc - disc
    return 2 * d / (n * (n - 1)) if n > 1 else 1.0


def auc(positives, negatives):
    """Probabilidade de que um positivo receba score maior que um negativo (Mann-Whitney)."""
    if not positives or not negatives:
        return None
    wins = ties = 0
    for p in positives:
        for n in negatives:
            if p > n:
                wins += 1
            elif p == n:
                ties += 1
    return (wins + 0.5 * ties) / (len(positives) * len(negatives))


def ndcg_at_k(scores, labels, k=5):
    pairs = sorted(zip(scores, labels), key=lambda t: -t[0])[:k]
    dcg = sum(l / math.log2(i + 2) for i, (_, l) in enumerate(pairs))
    ideal = sorted(labels, reverse=True)[:k]
    idcg = sum(l / math.log2(i + 2) for i, l in enumerate(ideal))
    return dcg / idcg if idcg > 0 else 0.0


def evaluate(model_scores, eligible_mask, labels, name):
    """model_scores[(a,e)] -> número; pares ineligible são excluídos."""
    pairs = [(a, e) for a in labels for e in labels[a] if eligible_mask[(a, e)]]
    xs = [model_scores[(a, e)] for a, e in pairs]
    ys = [labels[a][e] for a, e in pairs]
    rho = spearman(xs, ys)
    # AUC
    pos = [s for s, l in zip(xs, ys) if l >= 2]
    neg = [s for s, l in zip(xs, ys) if l <= 1]
    auc_v = auc(pos, neg)
    # por artista
    p3, t1, ndcg = [], [], []
    for a in labels:
        cand = [(e, model_scores[(a, e)], labels[a][e]) for e in labels[a]
                if eligible_mask[(a, e)]]
        if not cand:
            continue
        cand.sort(key=lambda t: -t[1])
        lab = [c[2] for c in cand]
        if any(l >= 2 for l in lab):
            top3 = lab[:3]
            p3.append(sum(1 for l in top3 if l >= 2) / 3)
            t1.append(1.0 if lab[0] >= 2 else 0.0)
        sc = [c[1] for c in cand]
        ndcg.append(ndcg_at_k(sc, lab, 5))
    def mean(v):
        return sum(v) / len(v) if v else float("nan")
    return {"model": name, "spearman": rho, "auc": auc_v, "precision_at3": mean(p3),
            "top1": mean(t1), "ndcg_at5": mean(ndcg), "n_pairs": len(pairs)}


# ------------------------------------------------------ dados

labels = GROUND_TRUTH
artists = ARTISTAS
editais = EDITAIS
edital_by_id = {e["id"]: e for e in editais}

# exporta dataset
with open(os.path.join(DATA, "editais_estruturados.json"), "w", encoding="utf-8") as f:
    json.dump(editais, f, ensure_ascii=False, indent=1)
with open(os.path.join(DATA, "artistas.json"), "w", encoding="utf-8") as f:
    json.dump(artists, f, ensure_ascii=False, indent=1)
with open(os.path.join(DATA, "ground_truth.json"), "w", encoding="utf-8") as f:
    json.dump({"rubrica": "3 forte / 2 boa / 1 marginal / 0 sem aderência ou ineligível", "labels": labels}, f, ensure_ascii=False, indent=1)
with open(os.path.join(DATA, "editais_metadata_30.json"), "w", encoding="utf-8") as f:
    json.dump([{"edital": t, "linguagem": l, "ano": a} for t, l, a in METADATA_30], f, ensure_ascii=False, indent=1)

# ------------------------------------------------------ scores

idx = TfidfIndex([edital_flat_text(e) for e in editais])
edital_index = {e["id"]: i for i, e in enumerate(editais)}

spec_w = dict(engine.SPEC_WEIGHTS)
equal_w = {k: 0.125 for k in spec_w}


def strip_roles(editais_src):
    """Remove papéis core/support (mescla as listas) — simula especificação literal."""
    import copy
    out = copy.deepcopy(editais_src)
    for e in out:
        rules = e["artistic_requirements"]["languages"]
        vals = []
        strength = "undeclared"
        for r in rules:
            vals += r["value"]
            order = {"explicit_mandatory": 0, "preference": 1, "undeclared": 2}
            if order[r["strength"]] < order[strength]:
                strength = r["strength"]
        e["artistic_requirements"]["languages"] = [{"value": vals, "strength": strength}]
    return out


editais_plain = strip_roles(editais)


def run_model(cap, weights=None, alpha=0.6, null_mode="renormalize", ed_list=None):
    ed_list = ed_list or editais_plain
    out = {}
    for a in artists:
        for e in ed_list:
            r = rank_artist_edital(a, e, weights=weights, alpha=alpha,
                                   cap_by_explicit=cap, null_mode=null_mode)
            score = r["final"] if r["eligibility"] != "INELIGIBLE" else -1.0
            if score is None:
                score = 0.0
            out[(a["id"], e["id"])] = score
    return out


def eligibility_map():
    m = {}
    for a in artists:
        for e in editais:
            r = engine.check_eligibility(a, e)
            m[(a["id"], e["id"])] = r["status"] != "INELIGIBLE"
    return m


eligible = eligibility_map()

models = {
    "random": {},
    "language_only": {},
    "tfidf_full": {},
    "userC_formula": {},
    "v0_spec_literal": run_model(cap=False),
    "v2_cap_requisitos": run_model(cap=True),
    "v3_cap_papeis_linguagem": run_model(cap=True, ed_list=editais),
    "v4_cap_papeis_neutral": run_model(cap=True, ed_list=editais, null_mode="neutral"),
    "equal_v4_com_cap": run_model(cap=True, weights=equal_w, ed_list=editais, null_mode="neutral"),
}

rng = random.Random(42)
for (a, e) in eligible:
    models["random"][(a, e)] = rng.random() if eligible[(a, e)] else -1.0
    art = next(x for x in artists if x["id"] == a)
    edi = edital_by_id[e]
    lv = engine.req_values(edi["artistic_requirements"]["languages"])
    if lv:
        langs = art["languages_main"] + art["languages_secondary"]
        best = max(lang_match(langs, v) for v, s in lv)
        models["language_only"][(a, e)] = best if eligible[(a, e)] else -1.0
    else:
        models["language_only"][(a, e)] = 0.5 if eligible[(a, e)] else -1.0
    art_i = [x["id"] for x in artists].index(a)
    models["tfidf_full"][(a, e)] = idx.cosine(edital_index[e], artist_flat_text(art)) if eligible[(a, e)] else -1.0
    models["userC_formula"][(a, e)] = art["coverage"]["campos_preenchidos"] * 0.35 + art["coverage"]["qualidade_evidencias"] * 0.30 + art["coverage"]["atualidade"] * 0.15 + art["coverage"]["confianca_extracao"] * 0.20
    models["userC_formula"][(a, e)] = 100 * models["userC_formula"][(a, e)]

metrics = [evaluate(models[k], eligible, labels, k) for k in models]

# ------------------------------------------------------ sensibilidade dos pesos

base_ranking = [models["v0_spec_literal"][(a["id"], e["id"])] for a in artists for e in editais]
sens = {}
for k in spec_w:
    for delta, tag in ((+0.05, "+0.05"), (-0.05, "-0.05")):
        w = dict(spec_w)
        w[k] = max(0.0, w[k] + delta)
        s = sum(w.values())
        w = {kk: vv / s for kk, vv in w.items()}
        m = run_model(cap=False, weights=w)
        rk = [m[(a["id"], e["id"])] for a in artists for e in editais]
        sens[f"{k}{tag}"] = kendall_tau(base_ranking, rk)
sens["equal_vs_spec"] = kendall_tau(base_ranking, [models["equal_v4_com_cap"][(a["id"], e["id"])] for a in artists for e in editais])

# ------------------------------------------------------ saturação

v0 = models["v0_spec_literal"]
elig_scores = [v for (a, e), v in v0.items() if eligible[(a, e)]]
sat = {
    "n_eligible_pairs": len(elig_scores),
    "mean": sum(elig_scores) / len(elig_scores),
    "std": (sum((x - sum(elig_scores) / len(elig_scores)) ** 2 for x in elig_scores) / len(elig_scores)) ** 0.5,
    "min": min(elig_scores), "max": max(elig_scores),
    "pct_above_70": 100 * sum(1 for x in elig_scores if x > 70) / len(elig_scores),
    "pct_above_60": 100 * sum(1 for x in elig_scores if x > 60) / len(elig_scores),
    "pct_within_60_85": 100 * sum(1 for x in elig_scores if 60 <= x <= 85) / len(elig_scores),
}
per_edital = {}
for e in editais:
    vals = [v0[(a["id"], e["id"])] for a in artists if eligible[(a["id"], e["id"])]]
    per_edital[e["id"]] = {
        "mean": sum(vals) / len(vals),
        "std": (sum((x - sum(vals) / len(vals)) ** 2 for x in vals) / len(vals)) ** 0.5 if len(vals) > 1 else 0.0,
        "pct_above_70": 100 * sum(1 for x in vals if x > 70) / len(vals),
    }
sat["per_edital"] = per_edital

# confiança C: variância e correlação com compatibilidade
conf_by_artist = {a["id"]: 100 * (0.35 * a["coverage"]["campos_preenchidos"] + 0.30 * a["coverage"]["qualidade_evidencias"] + 0.15 * a["coverage"]["atualidade"] + 0.20 * a["coverage"]["confianca_extracao"]) for a in artists}
cvals = list(conf_by_artist.values())
conf_stats = {"mean": sum(cvals) / len(cvals), "std": (sum((x - sum(cvals) / len(cvals)) ** 2 for x in cvals) / len(cvals)) ** 0.5,
              "min": min(cvals), "max": max(cvals),
              "spearman_vs_compat_media": spearman([conf_by_artist[a["id"]] for a in artists],
                                                   [sum(v0[(a["id"], e["id"])] for e in editais if eligible[(a["id"], e["id"])]) / max(1, sum(1 for e in editais if eligible[(a["id"], e["id"])])) for a in artists])}

# ------------------------------------------------------ casos ilustrativos

cases = []
for a, eid in (("ana_foto_memoria", "malakoff_observa4"), ("ana_foto_memoria", "festival_danca_2026"),
               ("ana_foto_memoria", "spa_2026"), ("mestre_bituca", "fic_2025"), ("mestre_bituca", "sao_joao_2026"),
               ("marina_multimidia", "malakoff_observa4"), ("dj_grafite", "virado_periferia_2026"),
               ("seu_ze_artesao", "joel_datz"), ("cia_duo_cenico", "aprendiz_em_cena_2026"),
               ("beto_iniciante", "malakoff_observa4")):
    art = next(x for x in artists if x["id"] == a)
    edi = edital_by_id[eid]
    r = rank_artist_edital(art, edi, cap_by_explicit=False)
    cases.append({"artist": a, "edital": eid, "label": labels[a][eid],
                  "eligibility": r["eligibility"], "elig_fails": r["elig_fails"],
                  "final_v0": r["final"], "factors": {k: (None if v is None else round(v, 3)) for k, v in r["factors"].items()}})

# ------------------------------------------------------ matrizes CSV

for tag, m in (("score_matrix_v0.csv", models["v0_spec_literal"]), ("score_matrix_v2.csv", models["v2_cap_requisitos"]),
               ("score_matrix_v4.csv", models["v4_cap_papeis_neutral"])):
    with open(os.path.join(RES, tag), "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f)
        wr.writerow(["artista"] + [e["id"] for e in editais])
        for a in artists:
            row = [a["id"]]
            for e in editais:
                v = m[(a["id"], e["id"])]
                row.append("" if v < 0 else f"{v:.1f}")
            wr.writerow(row)

with open(os.path.join(RES, "metrics_summary.json"), "w", encoding="utf-8") as f:
    json.dump(metrics, f, ensure_ascii=False, indent=1)
with open(os.path.join(RES, "sensitivity.json"), "w", encoding="utf-8") as f:
    json.dump(sens, f, ensure_ascii=False, indent=1)
with open(os.path.join(RES, "saturation.json"), "w", encoding="utf-8") as f:
    json.dump({"geral": sat, "confianca_C": {"por_artista": conf_by_artist, "stats": conf_stats}}, f, ensure_ascii=False, indent=1)
with open(os.path.join(RES, "cases.json"), "w", encoding="utf-8") as f:
    json.dump(cases, f, ensure_ascii=False, indent=1)

# ------------------------------------------------------ relatório no console

print("=" * 70)
print("MÉTRICAS (144 pares; pares INELIGIBLE excluídos das métricas de ranking)")
for m in metrics:
    print(f"{m['model']:<20} spearman={m['spearman']:+.3f}  auc={m['auc']:.3f}  P@3={m['precision_at3']:.3f}  top1={m['top1']:.3f}  NDCG@5={m['ndcg_at5']:.3f}  n={m['n_pairs']}")
print("-" * 70)
print("SENSIBILIDADE (Kendall tau vs ranking spec_v0 após perturbar peso ±0.05):")
for k, v in sorted(sens.items(), key=lambda t: abs(t[1] - 1)):
    print(f"  {k:<16} tau={v:+.3f}")
print("-" * 70)
print("SATURAÇÃO v0:", json.dumps({k: (round(v, 2) if isinstance(v, float) else v) for k, v in sat.items() if k != 'per_edital'}))
print("  por edital (mean / std / %>70):")
for eid, s in per_edital.items():
    print(f"    {eid:<26} {s['mean']:5.1f} / {s['std']:4.1f} / {s['pct_above_70']:5.1f}%")
print("-" * 70)
print("CONFIANÇA C:", json.dumps({k: (round(v, 3) if isinstance(v, float) else v) for k, v in conf_stats.items()}))
print("  por artista:", {k: round(v, 1) for k, v in conf_by_artist.items()})
print("-" * 70)
print("CASOS:")
for c in cases:
    print(f"  {c['artist']:<18} × {c['edital']:<24} label={c['label']}  elig={c['eligibility']:<10} score_v0={c['final_v0']}")
print("=" * 70)
