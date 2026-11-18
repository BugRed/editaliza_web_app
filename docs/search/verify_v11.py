# -*- coding: utf-8 -*-
"""Verificação da especificação v1.1: cada afirmação numérica contra os dados reais."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dataset_editais import EDITAIS
from dataset_artistas import ARTISTAS
import engine
from engine import rank_artist_edital
from run_experiments import GROUND_TRUTH, eligible, models, labels, editais, artists, edital_by_id, editais_plain

RES = "/home/z/my-project/download/artistrank/results"
mets = {m["model"]: m for m in json.load(open(os.path.join(RES, "metrics_summary.json"), encoding="utf-8"))}
sat = json.load(open(os.path.join(RES, "saturation.json"), encoding="utf-8"))["geral"]
sat4 = json.load(open(os.path.join(RES, "saturation_v4.json"), encoding="utf-8"))
sens = json.load(open(os.path.join(RES, "sensitivity.json"), encoding="utf-8"))
cases = {f"{c['artist']} × {c['edital']}": c for c in json.load(open(os.path.join(RES, "cases_por_versao.json"), encoding="utf-8"))}
proj = json.load(open(os.path.join(RES, "projecao_competitiva_malakoff.json"), encoding="utf-8"))
top3 = json.load(open(os.path.join(RES, "top3_v4.json"), encoding="utf-8"))

ok, fail = [], []

def check(desc, claimed, actual, tol=0.051):
    good = (abs(claimed - actual) <= tol) if isinstance(claimed, (int, float)) else (claimed == actual)
    (ok if good else fail).append((desc, claimed, actual))
    print(("OK  " if good else "ERRO") + f"  {desc}: v1.1={claimed} | real={actual}")

# --- 27.2 métricas por modelo
for model, key in [("v0_spec_literal", "v0"), ("v2_cap_requisitos", "v2"), ("v3_cap_papeis_linguagem", "v3"),
                   ("v4_cap_papeis_neutral", "v4"), ("equal_v4_com_cap", "v4 iguais"), ("random", "aleatório"),
                   ("tfidf_full", "tfidf"), ("language_only", "só linguagem"), ("userC_formula", "C")]:
    m = mets[model]
    print(f"{model:<26} spearman={m['spearman']:.3f} auc={m['auc']:.3f} P@3={m['precision_at3']:.3f} top1={m['top1']:.3f} ndcg={m['ndcg_at5']:.3f}")

# --- 27.6 saturação
check("27.6 v0 média global", 50.3, round(sat["mean"], 1))
check("27.6 v0 desvio global", 16.6, round(sat["std"], 1))
check("27.6 v0 % >70", 14.2, round(sat["pct_above_70"], 1))
check("27.6 FIC v0 média", 64.7, round(sat["per_edital"]["fic_2025"]["mean"], 1))
check("27.6 FIC v0 desvio", 5.6, round(sat["per_edital"]["fic_2025"]["std"], 1))
check("27.6 FIC v4 média", 62.3, round(sat4["fic_2025"]["mean"], 1))
check("27.6 FIC v4 desvio", 3.7, round(sat4["fic_2025"]["std"], 1))
check("27.6 formação v0 média", 60.7, round(sat["per_edital"]["formacao_tecnica_2026"]["mean"], 1))
check("27.6 formação v0 desvio", 8.1, round(sat["per_edital"]["formacao_tecnica_2026"]["std"], 1))
check("27.6 formação v4 média", 60.3, round(sat4["formacao_tecnica_2026"]["mean"], 1))
check("27.6 formação v4 desvio", 6.1, round(sat4["formacao_tecnica_2026"]["std"], 1))

# --- 27.4 sensibilidade
taus = [v for k, v in sens.items() if k != "equal_vs_spec"]
check("27.4 tau min", 0.953, round(min(taus), 3), tol=0.0006)
check("27.4 tau max", 0.973, round(max(taus), 3), tol=0.0006)
check("27.4 tau pesos iguais", 0.883, round(sens["equal_vs_spec"], 3), tol=0.0006)

# --- 27.5 casos
c = cases["ana_foto_memoria × festival_danca_2026"]
check("27.5.1 Ana×Dança v0", 67.0, c["scores"]["v0"])
check("27.5.1 Ana×Dança v3", 45.0, c["scores"]["v3"])
check("27.5.1 Ana×Dança v4", 45.0, c["scores"]["v4"])
c = cases["beto_iniciante × malakoff_observa4"]
check("27.5.2 Beto×Malakoff v0", 80.2, c["scores"]["v0"])
check("27.5.2 Beto×Malakoff v4", 77.1, c["scores"]["v4"])
check("27.5.2 Beto×Malakoff cobertura", 0.75, c["coverage"])
cases_run = {f"{c['artist']} × {c['edital']}": c for c in json.load(open(os.path.join(RES, "cases.json"), encoding="utf-8"))}
check("27.5.3 Bituca×FIC afinidade", 59.3, round(cases_run["mestre_bituca × fic_2025"]["final_v0"], 1), tol=0.06)
check("27.5.4 Cia×Aprendiz v4", 84.3, cases["cia_duo_cenico × aprendiz_em_cena_2026"]["scores"]["v4"])
check("27.5.5 Théo×Circo v4", 82.5, cases["theo_palhaco × mostra_circo_2026"]["scores"]["v4"])

# --- 27.7 projeção competitiva
check("27.7 Ana total/26", 21.0, proj["ana_foto_memoria"]["total"])
check("27.7 Marina total/26", 21.6, proj["marina_multimidia"]["total"])
check("27.7 Beto total/26", 16.4, proj["beto_iniciante"]["total"])
check("9.8 Ana compat v4", 70.5, proj["ana_foto_memoria"]["compatibilidade_v4"])
check("9.8 Marina compat v4", 69.9, proj["marina_multimidia"]["compatibilidade_v4"])
check("9.8 Beto compat v4", 77.1, proj["beto_iniciante"]["compatibilidade_v4"])

# --- 27.1 distribuição de rótulos e bloqueios
from collections import Counter
allc = Counter(); elc = Counter(); blocked_rel = []
for a, d in GROUND_TRUTH.items():
    for e, l in d.items():
        allc[l] += 1
        if eligible[(a, e)]:
            elc[l] += 1
        elif l >= 2:
            blocked_rel.append((a, e, l))
print(f"\nRÓTULOS: total 0/1/2/3 = {allc[0]}/{allc[1]}/{allc[2]}/{allc[3]} (v1.1: 83/25/20/16)")
check("27.1 pares elegíveis", 120, sum(elc.values()))
check("27.1 bloqueados", 24, sum(allc.values()) - sum(elc.values()))
check("27.1 bloqueados %", 16.7, round(100 * 24 / 144, 1))
check("27.1 relevantes elegíveis (>=2)", 33, sum(v for k, v in elc.items() if k >= 2))
print("pares bloqueados com rótulo >= 2:", blocked_rel)

# --- 27.12: resolver Top-1 = 1,000 (11 artistas) vs "10 dos 12"
print("\nRESOLUÇÃO 27.12 — top-1 por artista (v4, apenas elegíveis):")
n_rel_top1 = n_strong_top1 = n_with_rel = 0
for art in ARTISTAS:
    cand = []
    for e in EDITAIS:
        r = rank_artist_edital(art, e, cap_by_explicit=True, null_mode="neutral")
        if r["eligibility"] != "INELIGIBLE" and r["final"] is not None:
            cand.append((e["id"], r["final"]))
    cand.sort(key=lambda t: -t[1])
    lab = GROUND_TRUTH[art["id"]][cand[0][0]]
    has_rel = any(GROUND_TRUTH[art["id"]][e] >= 2 for e, _ in cand)
    n_with_rel += has_rel
    n_rel_top1 += (lab >= 2)
    n_strong_top1 += (lab == 3)
    print(f"  {art['id']:<20} top1={cand[0][0]:<24} score={cand[0][1]:5.1f} rótulo={lab}  tem_relevante={has_rel}")
print(f"  -> artistas com opção relevante: {n_with_rel}/12; top-1 relevante (>=2): {n_rel_top1}/12; top-1 FORTE (3): {n_strong_top1}/12")

# --- comportamento do teto: aplicado ao score combinado (como no motor testado)?
ana = next(a for a in ARTISTAS if a["id"] == "ana_foto_memoria")
fest = edital_by_id["festival_danca_2026"]
r_uncapped = rank_artist_edital(ana, fest, cap_by_explicit=False, null_mode="neutral")
r_capped = rank_artist_edital(ana, fest, cap_by_explicit=True, null_mode="neutral")
print(f"\nTETO Ana×Dança: artist_score(sem cap)={r_uncapped['artist_score']*100:.1f} | final_raw={r_uncapped['final_raw']:.1f} | cap={r_capped['cap']} | final={r_capped['final']:.1f}")
print("   -> no motor testado o teto é aplicado ao score FINAL combinado (0,35 artista + 0,65 portfólio), não ao score bruto do artista")

# --- C: faixa e correlação
conf = json.load(open(os.path.join(RES, "saturation.json"), encoding="utf-8"))["confianca_C"]
check("14.4 C min", 53.5, round(conf["stats"]["min"], 1))
check("14.4 C max", 91.2, round(conf["stats"]["max"], 1))
check("14.4 C média", 74.0, round(conf["stats"]["mean"], 1))
check("14.4 C desvio", 15.3, round(conf["stats"]["std"], 1))
check("14.4 C correlação c/ compat", 0.385, round(conf["stats"]["spearman_vs_compat_media"], 3), tol=0.0006)

print(f"\n===== RESULTADO: {len(ok)} conferidos OK, {len(fail)} divergências =====")
for d, c1, a1 in fail:
    print(f"  DIVERGÊNCIA: {d}: v1.1={c1} | real={a1}")
