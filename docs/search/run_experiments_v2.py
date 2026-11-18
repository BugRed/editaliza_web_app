# -*- coding: utf-8 -*-
"""Benchmark v2.0 — dados REAIS (ganhadores travados). Ablação v0/v4 + pesos iguais.
Métrica: posição do vencedor real entre os concorrentes elegíveis, por edital."""
import json
import os
import sys
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, "/home/z/my-project/scripts/artistrank")
from dataset_real import ARTISTAS, EDITAIS, ANCHORS, EXCLUDED  # noqa
from engine import rank_artist_edital, SPEC_WEIGHTS  # noqa

RES = os.path.join(HERE, "results")
os.makedirs(RES, exist_ok=True)

ART_BY_ID = {a["id"]: a for a in ARTISTAS}
ED_BY_ID = {e["id"]: e for e in EDITAIS}
ED_ORDER = [e["id"] for e in EDITAIS]


def rank_edital(edital_id, weights, null_mode, cap):
    """Retorna ranking (tie-aware) dos candidatos para o edital + posição do melhor âncora."""
    e = ED_BY_ID[edital_id]
    anchors = ANCHORS[edital_id]
    excluded = EXCLUDED.get(edital_id, [])
    candidates = [a["id"] for a in ARTISTAS if a["id"] not in anchors and a["id"] not in excluded]
    scored = []
    for cid in candidates + anchors:
        r = rank_artist_edital(ART_BY_ID[cid], e, weights=weights, cap_by_explicit=cap, null_mode=null_mode)
        scored.append((r["final"] if r["final"] is not None else -1.0, cid))
    # tie-aware: rank = 1 + nº de scores estritamente maiores
    best = -1.0
    for s, cid in scored:
        if cid in anchors and s > best:
            best = s
    ranks = sorted(scored, key=lambda t: -t[0])
    best_rank = 1 + sum(1 for s, _ in scored if s > best)
    n_cand = len(scored)
    return best_rank, n_cand, best


def evaluate(weights, null_mode, cap, label):
    rows = []
    for eid in ED_ORDER:
        rank, n, score = rank_edital(eid, weights, null_mode, cap)
        rows.append({"edital": eid, "best_anchor_rank": rank, "n_candidates": n,
                     "hit1": rank == 1, "hit3": rank <= 3, "rr": 1.0 / rank})
    mrr = sum(r["rr"] for r in rows) / len(rows)
    hit1 = sum(r["hit1"] for r in rows) / len(rows)
    hit3 = sum(r["hit3"] for r in rows) / len(rows)
    mean_rank = sum(r["best_anchor_rank"] for r in rows) / len(rows)
    print(f"\n== {label} ==  MRR={mrr:.3f}  Hit@1={hit1:.3f} ({sum(r['hit1'] for r in rows)}/{len(rows)})  "
          f"Hit@3={hit3:.3f} ({sum(r['hit3'] for r in rows)}/{len(rows)})  rank médio={mean_rank:.1f}")
    for r in rows:
        mark = "OK " if r["hit1"] else ("~  " if r["hit3"] else "X  ")
        print(f"  {mark}{r['edital']:<28} rank={r['best_anchor_rank']:>2}/{r['n_candidates']}")
    return {"label": label, "rows": rows, "mrr": mrr, "hit1": hit1, "hit3": hit3, "mean_rank": mean_rank}


if __name__ == "__main__":
    results = []
    results.append(evaluate(SPEC_WEIGHTS, "renormalize", False, "v0 — especificação literal (nulos 0 + renormalização, sem teto)"))
    results.append(evaluate(SPEC_WEIGHTS, "neutral", True, "v2 — teto por requisito explícito (nulos renormalizados)"))
    results.append(evaluate(SPEC_WEIGHTS, "neutral", True, "v4 — nulos neutros 0,5 + teto + papéis"))
    eq = {k: 0.125 for k in SPEC_WEIGHTS}
    results.append(evaluate(eq, "neutral", True, "v4 com pesos iguais"))
    json.dump(results, open(f"{RES}/benchmark_real.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("\ngravado:", f"{RES}/benchmark_real.json")
