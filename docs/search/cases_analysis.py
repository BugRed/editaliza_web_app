# -*- coding: utf-8 -*-
"""Casos por versão do motor + top-3 recomendações por artista + saturação v4."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dataset_editais import EDITAIS
from dataset_artistas import ARTISTAS
import engine
from engine import rank_artist_edital
from run_experiments import strip_roles, GROUND_TRUTH

editais_plain = strip_roles(EDITAIS)
edital_by_id = {e["id"]: e for e in EDITAIS}
edital_plain_by_id = {e["id"]: e for e in editais_plain}
labels = GROUND_TRUTH

CASES = [("ana_foto_memoria", "malakoff_observa4"), ("ana_foto_memoria", "festival_danca_2026"),
         ("ana_foto_memoria", "spa_2026"), ("beto_iniciante", "malakoff_observa4"),
         ("mestre_bituca", "malakoff_observa4"), ("mestre_bituca", "sao_joao_2026"),
         ("marina_multimidia", "malakoff_observa4"), ("dj_grafite", "virado_periferia_2026"),
         ("seu_ze_artesao", "joel_datz"), ("cia_duo_cenico", "aprendiz_em_cena_2026"),
         ("rosa_cordel", "letra_e_voz_2026"), ("theo_palhaco", "mostra_circo_2026")]

CONFIGS = [
    ("v0", dict(cap_by_explicit=False, ed=edital_plain_by_id, null_mode="renormalize")),
    ("v2", dict(cap_by_explicit=True, ed=edital_plain_by_id, null_mode="renormalize")),
    ("v3", dict(cap_by_explicit=True, ed=edital_by_id, null_mode="renormalize")),
    ("v4", dict(cap_by_explicit=True, ed=edital_by_id, null_mode="neutral")),
]

print(f"{'caso':<42} {'label':<6} {'v0':>6} {'v2':>6} {'v3':>6} {'v4':>6}  elig")
rows = []
for a, eid in CASES:
    art = next(x for x in ARTISTAS if x["id"] == a)
    line = [f"{a} × {eid}", labels[a][eid]]
    scores = {}
    for name, cfg in CONFIGS:
        r = rank_artist_edital(art, cfg["ed"][eid], cap_by_explicit=cfg["cap_by_explicit"],
                               null_mode=cfg["null_mode"])
        sc = r["final"] if r["eligibility"] != "INELIGIBLE" else -1.0
        scores[name] = round(sc, 1) if sc >= 0 else "INELIG"
    line += [scores[c[0]] for c in CONFIGS]
    r0 = rank_artist_edital(art, edital_plain_by_id[eid], cap_by_explicit=False)
    line.append(r0["eligibility"])
    print(f"{a} × {eid:<22} {labels[a][eid]:<6} {scores['v0']!s:>6} {scores['v2']!s:>6} {scores['v3']!s:>6} {scores['v4']!s:>6}  {r0['eligibility']}")
    rows.append({"artist": a, "edital": eid, "label": labels[a][eid], "scores": scores,
                 "eligibility": r0["eligibility"], "fails": r0["elig_fails"], "unknowns": r0["elig_unknowns"],
                 "factors": {k: (None if v is None else round(v, 3)) for k, v in r0["factors"].items()},
                 "confidence": round(r0["confidence"], 1), "coverage": round(r0["coverage"], 2)})

print("\nTOP-3 RECOMENDAÇÕES POR ARTISTA (v4)")
top3 = {}
for art in ARTISTAS:
    cand = []
    for e in EDITAIS:
        r = rank_artist_edital(art, e, cap_by_explicit=True, null_mode="neutral")
        if r["eligibility"] == "INELIGIBLE":
            continue
        cand.append((e["id"], r["final"] if r["final"] is not None else 0.0, r["eligibility"]))
    cand.sort(key=lambda t: -t[1])
    top3[art["id"]] = [{"edital": c[0], "score": round(c[1], 1), "elig": c[2], "label": labels[art["id"]][c[0]]} for c in cand[:3]]
    print(f"  {art['name']:<18} -> " + " | ".join(f"{c[0]} {round(c[1])} (label {labels[art['id']][c[0]]}, {c[2]})" for c in cand[:3]))

# saturação v4
sat4 = {}
for e in EDITAIS:
    vals = []
    for art in ARTISTAS:
        r = rank_artist_edital(art, e, cap_by_explicit=True, null_mode="neutral")
        if r["eligibility"] != "INELIGIBLE" and r["final"] is not None:
            vals.append(r["final"])
    m = sum(vals) / len(vals)
    sd = (sum((x - m) ** 2 for x in vals) / len(vals)) ** 0.5 if len(vals) > 1 else 0.0
    sat4[e["id"]] = {"mean": round(m, 1), "std": round(sd, 1),
                     "pct_above_70": round(100 * sum(1 for x in vals if x > 70) / len(vals), 1)}
print("\nSATURAÇÃO v4 (mean / std / %>70):")
for eid, s in sat4.items():
    print(f"  {eid:<26} {s['mean']:5.1f} / {s['std']:4.1f} / {s['pct_above_70']:5.1f}%")

out = "/home/z/my-project/download/artistrank/results"
with open(os.path.join(out, "cases_por_versao.json"), "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=1)
with open(os.path.join(out, "top3_v4.json"), "w", encoding="utf-8") as f:
    json.dump(top3, f, ensure_ascii=False, indent=1)
with open(os.path.join(out, "saturation_v4.json"), "w", encoding="utf-8") as f:
    json.dump(sat4, f, ensure_ascii=False, indent=1)

# breakdown de fatores do caso-assinatura ana × malakoff
ana = next(x for x in ARTISTAS if x["id"] == "ana_foto_memoria")
r = rank_artist_edital(ana, edital_by_id["malakoff_observa4"], cap_by_explicit=True, null_mode="neutral")
print("\nBREAKDOWN ana × malakoff (v4):", json.dumps({k: (None if v is None else round(v, 3)) for k, v in r["factors"].items()}), "final=", round(r["final"], 1), "conf=", round(r["confidence"], 1), "cov=", round(r["coverage"], 2))
with open(os.path.join(out, "breakdown_ana_malakoff.json"), "w", encoding="utf-8") as f:
    json.dump({k: v for k, v in r.items() if k != "factors"} | {"factors": r["factors"]}, f, ensure_ascii=False, indent=1, default=str)
print("\nsalvo: cases_por_versao.json, top3_v4.json, saturation_v4.json, breakdown_ana_malakoff.json")
