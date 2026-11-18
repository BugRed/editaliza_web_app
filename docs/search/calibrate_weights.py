# -*- coding: utf-8 -*-
"""Calibração de pesos contra ganhadores REAIS (26 pares travados).
Coordenada por coordenada, objetivo = MRR dos ganhadores; validação leave-one-out por edital."""
import copy
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, "/home/z/my-project/scripts/artistrank")
from dataset_real import ARTISTAS, EDITAIS, ANCHORS, EXCLUDED  # noqa
from engine import rank_artist_edital, SPEC_WEIGHTS  # noqa

ART_BY_ID = {a["id"]: a for a in ARTISTAS}
ED_BY_ID = {e["id"] for e in EDITAIS}
ED_BY = {e["id"]: e for e in EDITAIS}
ED_ORDER = [e["id"] for e in EDITAIS]
RES = os.path.join(HERE, "results")
os.makedirs(RES, exist_ok=True)

KEYS = ["L", "C", "T", "P", "H", "O", "G", "V"]
MULTS = [0.4, 0.6, 0.8, 1.0, 1.25, 1.5, 2.0]


def mrr(weights, editais=None, detail=False):
    editais = editais or ED_ORDER
    tot, rows = 0.0, []
    for eid in editais:
        e = ED_BY[eid]
        anchors = ANCHORS[eid]
        excluded = EXCLUDED.get(eid, [])
        cands = [a["id"] for a in ARTISTAS if a["id"] not in anchors and a["id"] not in excluded]
        scored = []
        for cid in cands + anchors:
            r = rank_artist_edital(ART_BY_ID[cid], e, weights=weights, cap_by_explicit=True, null_mode="neutral")
            scored.append((r["final"] if r["final"] is not None else -1.0, cid))
        best = max(s for s, c in scored if c in anchors)
        rank = 1 + sum(1 for s, _ in scored if s > best)
        tot += 1.0 / rank
        rows.append((eid, rank, len(scored), best))
    if detail:
        return tot / len(editais), rows
    return tot / len(editais)


def calibrate(editais, w0=None, sweeps=3):
    w = dict(w0 or SPEC_WEIGHTS)
    cur = mrr(w, editais)
    trace = []
    for _ in range(sweeps):
        improved = False
        for k in KEYS:
            best_m, best_v = cur, w[k]
            for m in MULTS:
                if m == 1.0:
                    continue
                w2 = dict(w)
                w2[k] = w[k] * m
                v = mrr(w2, editais)
                if v > best_m + 1e-9:
                    best_m, best_v = v, w[k] * m
            if best_v != w[k]:
                w[k] = best_v
                cur = best_m
                improved = True
                trace.append((k, round(w[k], 3), round(cur, 4)))
        if not improved:
            break
    return w, cur, trace


if __name__ == "__main__":
    base = mrr(SPEC_WEIGHTS)
    print(f"MRR baseline (pesos spec 15/20/10/15/10/15/5/10): {base:.4f}")
    w_cal, m_cal, trace = calibrate(ED_ORDER)
    print(f"MRR calibrado (todos os editais): {m_cal:.4f}")
    print("trace:", trace)
    sumw = sum(w_cal.values())
    print("pesos calibrados (%):", {k: round(100 * v / sumw, 1) for k, v in w_cal.items()})
    eq = {k: 0.125 for k in KEYS}
    print(f"MRR pesos iguais: {mrr(eq):.4f}")

    # leave-one-out
    loo_scores = []
    for held in ED_ORDER:
        train = [e for e in ED_ORDER if e != held]
        w_i, m_i, _ = calibrate(train, sweeps=2)
        m_h = mrr(w_i, [held])
        loo_scores.append({"edital": held, "mrr_heldout": m_h,
                           "pesos": {k: round(100 * v / sum(w_i.values()), 1) for k, v in w_i.items()}})
    mean_loo = sum(x["mrr_heldout"] for x in loo_scores) / len(loo_scores)
    print(f"\nMRR leave-one-out médio: {mean_loo:.4f}")
    for x in loo_scores:
        print(f"  {x['edital']:<28} held-out MRR={x['mrr_heldout']:.3f}  pesos L={x['pesos']['L']} O={x['pesos']['O']} C={x['pesos']['C']} G={x['pesos']['G']}")

    mrr_final, rows = mrr(w_cal, detail=True)
    print("\nRanking com pesos calibrados:")
    for eid, rank, n, best in rows:
        mark = "OK " if rank == 1 else ("~  " if rank <= 3 else "X  ")
        print(f"  {mark}{eid:<28} rank={rank:>2}/{n}  melhor_score={best:.1f}")

    json.dump({"baseline_mrr": base, "calibrado_mrr": m_cal, "equal_mrr": mrr(eq),
               "pesos_calibrados": {k: w_cal[k] / sumw for k in w_cal},
               "pesos_normalizados_pct": {k: round(100 * w_cal[k] / sumw, 1) for k in w_cal},
               "loo": loo_scores, "loo_mean": mean_loo,
               "trace": trace, "ranking_calibrado": rows},
              open(f"{RES}/calibracao_real.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("\ngravado:", f"{RES}/calibracao_real.json")
