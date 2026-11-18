# -*- coding: utf-8 -*-
"""Calibração v3: busca por coordenadas no TREINO (split pré-registrado), LOO no treino,
avaliação no TESTE. Diagnóstico extra: AUC do cosine TF-IDF (camada semântica) como
contrafactual para separação ganhou × não-ganhou."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from engine_v3 import rank_artist_edital, SPEC_WEIGHTS  # noqa
from experiments_v3 import pool_of, ALL, EDS, ED_ORDER, LAB  # noqa

RES = os.path.join(HERE, "results")
GT_SPLIT = json.load(open(os.path.join(HERE, "data_v3/ground_truth_v3.json"), encoding="utf-8"))["split_treino_teste"]
TRAIN = [e for e in ED_ORDER if GT_SPLIT[e] == "treino"]
TEST = [e for e in ED_ORDER if GT_SPLIT[e] == "teste"]
KEYS = ["L", "C", "T", "P", "H", "O", "G", "V"]
MULTS = [0.4, 0.6, 0.8, 1.0, 1.25, 1.5, 2.0]


def mrr(weights, editais):
    tot, n = 0.0, 0
    for eid in editais:
        comps, anchors, aprov = pool_of(eid)
        if not anchors or not comps:
            continue
        sc = {}
        for cid in comps + anchors:
            r = rank_artist_edital(ALL[cid], EDS[eid], weights=weights, null_mode="neutral", cap_on=True)
            sc[cid] = r["final"] if r["final"] is not None else -1.0
        best = max(sc[a] for a in anchors)
        rank = 1 + sum(1 for f in sc.values() if f > best)
        tot += 1.0 / rank
        n += 1
    return tot / n if n else 0.0


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
                w[k], cur = best_v, best_m
                improved = True
                trace.append((k, round(w[k], 4), round(cur, 4)))
        if not improved:
            break
    return w, cur, trace


if __name__ == "__main__":
    print("TREINO:", TRAIN)
    print("TESTE:", TEST)
    base_tr = mrr(SPEC_WEIGHTS, TRAIN)
    base_te = mrr(SPEC_WEIGHTS, TEST)
    print(f"MRR treino baseline: {base_tr:.4f} | teste baseline: {base_te:.4f}")
    w_cal, m_cal, trace = calibrate(TRAIN)
    sumw = sum(w_cal.values())
    print(f"MRR treino calibrado: {m_cal:.4f} | trace: {trace}")
    print("pesos calibrados (%):", {k: round(100 * v / sumw, 1) for k, v in w_cal.items()})
    te_cal = mrr(w_cal, TEST)
    print(f"MRR teste com pesos calibrados no treino: {te_cal:.4f}")
    # LOO no treino
    loo = []
    for held in TRAIN:
        tr = [e for e in TRAIN if e != held]
        w_i, m_i, _ = calibrate(tr, sweeps=2)
        m_h = mrr(w_i, [held])
        n_comp = sum(1 for e2 in [held] if pool_of(e2)[0] and pool_of(e2)[1])
        if not n_comp:
            continue  # edital sem não-ganhadores: métrica não computável, não entra na média
        loo.append({"edital": held, "mrr": m_h,
                    "pesos": {k: round(100 * v / sum(w_i.values()), 1) for k, v in w_i.items()}})
    mean_loo = sum(x["mrr"] for x in loo) / len(loo) if loo else None
    print(f"MRR LOO médio (treino, só editais computáveis): {mean_loo:.4f} (n={len(loo)})" if loo else "LOO não computável")

    # diagnóstico TF-IDF: AUC do cosine contra rótulos (por edital com não-ganhadores)
    diag = {}
    for eid in ED_ORDER:
        comps, anchors, aprov = pool_of(eid)
        if not comps or not anchors:
            continue
        lab = {p["artista"]: p for p in LAB.get(eid, [])}
        pos = [lab[a]["cos_tfidf"] for a in anchors + aprov if a in lab]
        neg = [lab[c]["cos_tfidf"] for c in comps if c in lab and lab[c]["rotulo_A"] < 3]
        if not pos or not neg:
            continue
        wins = ties = 0
        for sp in pos:
            for sn in neg:
                wins += sp > sn
                ties += sp == sn
        diag[eid] = round((wins + 0.5 * ties) / (len(pos) * len(neg)), 3)
    print("AUC diagnóstico TF-IDF por edital:", diag)

    json.dump({"train": TRAIN, "test": TEST,
               "baseline_mrr_train": base_tr, "baseline_mrr_test": base_te,
               "calibrado_mrr_train": m_cal, "trace": trace,
               "pesos_calibrados_pct": {k: round(100 * v / sumw, 1) for k, v in w_cal.items()},
               "teste_mrr_calibrado": te_cal, "loo": loo, "loo_mean": mean_loo,
               "diagnostico_auc_tfidf": diag},
              open(os.path.join(RES, "calibracao_v3.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("gravado results/calibracao_v3.json")
