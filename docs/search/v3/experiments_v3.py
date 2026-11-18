# -*- coding: utf-8 -*-
"""Experimentos v3: v0/v2/v4/iguais + AUC/NDCG@5 + separação intra-linguagem + bootstrap
+ varredura do alpha (multi-obra) + calibração (treino/LOO) e avaliação no teste."""
import json
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from engine_v3 import rank_artist_edital, SPEC_WEIGHTS, EQUAL_WEIGHTS  # noqa
from labels_v3 import quadratic_kappa  # noqa

D = json.load(open(os.path.join(HERE, "data_v3/dataset_v3_full.json"), encoding="utf-8"))
ART = {a["id"]: a for a in D["artistas"]}
CAND = D["candidatos"]
ALL = dict(ART)
ALL.update(CAND)
EDS = {e["id"]: e for e in D["editais"]}
ED_ORDER = [e["id"] for e in D["editais"]]
GT = D["gt"]
ANCHORS, EXCL, ADD, CMAP = GT["anchors"], GT["excluded"], GT["aprovados_adicionais"], D["candidacy_map"]
PROM = D.get("candidacias_promovidos", {})
RES = os.path.join(HERE, "results")
os.makedirs(RES, exist_ok=True)

LAB = {p["edital"]: [] for p in json.load(open(os.path.join(RES, "rotulos_v3.json"), encoding="utf-8"))["pares"]}
for p in json.load(open(os.path.join(RES, "rotulos_v3.json"), encoding="utf-8"))["pares"]:
    LAB[p["edital"]].append(p)

MULTI_IDS = [a["id"] for a in D["artistas"] if len(a["artworks"]) >= 3]
MULTI2_IDS = [a["id"] for a in D["artistas"] if len(a["artworks"]) == 2]


def _norm(s):
    import re, unicodedata
    s = unicodedata.normalize("NFKD", (s or "").lower()).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", s).strip()


def pool_of(eid):
    """(competidores, âncoras, aprovados_adicionais). Exclusão por NOME: as linhas
    candidatas que são os próprios aprovados/âncoras não competem no próprio edital."""
    anchors = [x for x in ANCHORS.get(eid, []) if x in ALL]
    real_names = {_norm(ALL[x]["nome"]) for x in anchors}
    real_names |= {_norm(ALL[x]["nome"]) for x in EXCL.get(eid, []) if x in ALL}
    aprov = [x for x in ADD.get(eid, []) if x in ALL]
    real_names |= {_norm(ALL[x]["nome"]) for x in aprov}
    comps, seen = [], set()
    for cid in CMAP.get(eid, []):
        if cid in ALL and _norm(ALL[cid]["nome"]) not in real_names and cid not in seen:
            comps.append(cid)
            seen.add(cid)
    for aid, cs in PROM.items():
        if _norm(ALL[aid]["nome"]) in real_names:
            continue
        if any(c["edital"] == eid and c["situacao"] != "selecionado" for c in cs) and aid not in seen:
            comps.append(aid)
            seen.add(aid)
    return comps, anchors, aprov


def scores_for(eid, weights, null_mode, cap_on, alpha=0.6):
    comps, anchors, aprov = pool_of(eid)
    out = {}
    for cid in comps + anchors + aprov:
        r = rank_artist_edital(ALL[cid], EDS[eid], weights=weights, alpha=alpha,
                               null_mode=null_mode, cap_on=cap_on)
        out[cid] = r
    return out, comps, anchors, aprov


def evaluate(weights, null_mode, cap_on, alpha=0.6, editais=None, detail=False):
    editais = editais or ED_ORDER
    rows = []
    for eid in editais:
        sc, comps, anchors, real = scores_for(eid, weights, null_mode, cap_on, alpha)
        if not anchors or not comps:
            continue
        anchor_scores = [sc[a]["final"] for a in anchors if sc[a]["final"] is not None]
        if not anchor_scores:
            rows.append({"edital": eid, "skip": True,
                         "motivo": "sem nao-ganhadores publicados no resultado" if anchors else "sem anchors"})
            continue
        best = max(anchor_scores)
        all_f = [(sc[c]["final"] if sc[c]["final"] is not None else -1.0) for c in comps + anchors]
        rank = 1 + sum(1 for f in all_f if f > best)
        rows.append({"edital": eid, "rank": rank, "n": len(all_f), "rr": 1.0 / rank,
                     "hit1": rank == 1, "hit3": rank <= 3})
    valid = [r for r in rows if not r.get("skip")]
    mrr = sum(r["rr"] for r in valid) / len(valid) if valid else 0.0
    hit1 = sum(r["hit1"] for r in valid) / len(valid) if valid else 0.0
    hit3 = sum(r["hit3"] for r in valid) / len(valid) if valid else 0.0
    mr = sum(r["rank"] for r in valid) / len(valid) if valid else 0.0
    res = {"mrr": mrr, "hit1": hit1, "hit3": hit3, "mean_rank": mr, "rows": rows if detail else valid,
           "n_editais": len(valid)}
    if detail:
        res["rows"] = rows
    return res


def auc_ndcg(eid, weights, null_mode, cap_on, alpha=0.6):
    """AUC (ganhadores reais 3 vs não-ganhadores 0-2) e NDCG@5 contra rótulos."""
    sc, comps, anchors, real = scores_for(eid, weights, null_mode, cap_on, alpha)
    lab = {(p["artista"]): p["rotulo_A"] for p in LAB.get(eid, [])}
    pos = [(c, sc[c]["final"]) for c in real if c in sc and sc[c]["final"] is not None and lab.get(c, 0) >= 3]
    neg = [(c, sc[c]["final"]) for c in comps if c in sc and sc[c]["final"] is not None and lab.get(c, 0) < 3]
    auc = None
    if pos and neg:
        wins = ties = 0
        for _, sp in pos:
            for _, sn in neg:
                wins += sp > sn
                ties += sp == sn
        auc = (wins + 0.5 * ties) / (len(pos) * len(neg))
    # NDCG@5 com desempate aleatório (média sobre 20 permutações dos empates)
    import random as _rnd
    all_pairs = [(sc[c]["final"] if sc[c]["final"] is not None else -1.0, c) for c in comps + anchors]
    ndcgs = []
    rng = _rnd.Random(7)
    for _ in range(20):
        shuffled = sorted(all_pairs, key=lambda t: (t[0], rng.random()), reverse=True)[:5]
        dcg = sum((2 ** lab.get(c, 0) - 1) / math.log2(i + 2) for i, (f, c) in enumerate(shuffled))
        ideal = sorted([lab.get(c, 0) for _, c in shuffled], reverse=True)
        idcg = sum((2 ** l - 1) / math.log2(i + 2) for i, l in enumerate(ideal))
        if idcg:
            ndcgs.append(dcg / idcg)
    ndcg = sum(ndcgs) / len(ndcgs) if ndcgs else None
    return auc, ndcg, len(pos), len(neg)


def within_language(eid, weights, null_mode, cap_on, alpha=0.6):
    """Separação dentro da mesma linguagem: âncoras vs não-ganhadores da MESMA linguagem core."""
    from engine_v3 import lang_match
    sc, comps, anchors, real = scores_for(eid, weights, null_mode, cap_on, alpha)
    core = [v for r in EDS[eid]["artistic_requirements"]["languages"] if r.get("role", "core") == "core" for v in r["value"]]
    same_lang_comps = [c for c in comps
                       if ALL[c]["languages_main"] + ALL[c]["languages_secondary"]
                       and max(lang_match(ALL[c]["languages_main"] + ALL[c]["languages_secondary"], v) for v in core) >= 1.0]
    if not same_lang_comps or not anchors:
        return None
    anchor_scores = [sc[a]["final"] for a in anchors if sc[a]["final"] is not None]
    comp_scores = [sc[c]["final"] for c in same_lang_comps if sc[c]["final"] is not None]
    if not anchor_scores or not comp_scores:
        return None
    best = max(anchor_scores)
    wins = sum(1 for cs in comp_scores if best > cs)
    return {"n_same_lang_comps": len(comp_scores),
            "share_beaten": wins / len(comp_scores),
            "anchors_above": all(best >= cs for cs in comp_scores)}


import math  # noqa: E402

CONFIGS = [
    ("v0_especificacao_literal", SPEC_WEIGHTS, "zero", False),
    ("v2_teto", SPEC_WEIGHTS, "zero", True),
    ("v4_neutros_teto_papeis", SPEC_WEIGHTS, "neutral", True),
    ("v4_pesos_iguais", EQUAL_WEIGHTS, "neutral", True),
]

if __name__ == "__main__":
    results = {}
    for label, w, nm, cap in CONFIGS:
        r = evaluate(w, nm, cap, detail=True)
        aucs, ndcgs = [], []
        for eid in ED_ORDER:
            a, n, np_, nn = auc_ndcg(eid, w, nm, cap)
            if a is not None:
                aucs.append(a)
            if n is not None:
                ndcgs.append(n)
        wl = {}
        for eid in ED_ORDER:
            x = within_language(eid, w, nm, cap)
            if x:
                wl[eid] = x
        results[label] = {"mrr": r["mrr"], "hit1": r["hit1"], "hit3": r["hit3"], "mean_rank": r["mean_rank"],
                          "rows": r["rows"], "auc_medio": sum(aucs) / len(aucs) if aucs else None,
                          "ndcg5_medio": sum(ndcgs) / len(ndcgs) if ndcgs else None,
                          "n_editais_auc": len(aucs),
                          "dentro_linguagem": wl,
                          "dl_completo": sum(1 for x in wl.values() if x["anchors_above"]),
                          "dl_editais": len(wl)}
        print(f"{label}: MRR={r['mrr']:.3f} Hit@1={r['hit1']:.3f} ({sum(x['hit1'] for x in r['rows'])}/{len(r['rows'])}) "
              f"Hit@3={r['hit3']:.3f} AUC={results[label]['auc_medio'] if results[label]['auc_medio'] is not None else -1:.3f} "
        f"NDCG@5={results[label]['ndcg5_medio'] if results[label]['ndcg5_medio'] is not None else -1:.3f} "
              f"intra-linguagem completo={results[label]['dl_completo']}/{results[label]['dl_editais']}")
    # bootstrap por edital (v4)
    rng = random.Random(42)
    v4 = results["v4_neutros_teto_papeis"]
    rows = v4["rows"]
    boots = {"mrr": [], "hit1": [], "hit3": []}
    for _ in range(2000):
        sample = [rows[rng.randrange(len(rows))] for _ in range(len(rows))]
        boots["mrr"].append(sum(r["rr"] for r in sample) / len(sample))
        boots["hit1"].append(sum(r["hit1"] for r in sample) / len(sample))
        boots["hit3"].append(sum(r["hit3"] for r in sample) / len(sample))
    ci = {k: [round(sorted(v)[int(0.025 * len(v))], 3), round(sorted(v)[int(0.975 * len(v))], 3)] for k, v in boots.items()}
    print("IC 95% (bootstrap por edital, v4):", ci)

    # varredura do alpha no subconjunto multi-obra
    prom_ids = list(PROM.keys())
    multi_editais = [eid for eid in ED_ORDER
                     if any(aid in MULTI_IDS + MULTI2_IDS for aid in CMAP.get(eid, []))
                     or any(aid in MULTI_IDS + MULTI2_IDS for aid in ANCHORS.get(eid, []))
                     or any(aid in MULTI_IDS + MULTI2_IDS + prom_ids for aid in pool_of(eid)[0])]
    print("editais com candidatos multi-obra:", multi_editais)
    alpha_res = {}
    for alpha in (0.0, 0.4, 0.6, 0.8, 1.0):
        r = evaluate(SPEC_WEIGHTS, "neutral", True, alpha=alpha, editais=multi_editais)
        alpha_res[str(alpha)] = {"mrr": r["mrr"], "hit1": r["hit1"], "hit3": r["hit3"], "n": r["n_editais"]}
        print(f"  alpha={alpha}: MRR={r['mrr']:.3f} Hit@1={r['hit1']:.3f} (n={r['n_editais']})")
    # discordância melhor obra × média das 3 melhores
    from engine_v3 import score_artwork
    discord = []
    for eid in ED_ORDER:
        comps, anchors, aprov = pool_of(eid)
        cand_multi = [c for c in set(comps + anchors)
                      if c and len(ALL[c]["artworks"]) >= 2]
        if len(cand_multi) < 2:
            continue
        best_top, mean_top = None, None
        best_v, mean_v = -1.0, -1.0
        for c in cand_multi:
            ss = sorted([score_artwork(w, EDS[eid]) for w in ALL[c]["artworks"]], reverse=True)
            b = ss[0]
            m3 = sum(ss[:3]) / min(3, len(ss))
            if b > best_v:
                best_v, best_top = b, c
            if m3 > mean_v:
                mean_v, mean_top = m3, c
        if best_top is not None and mean_top is not None and best_top != mean_top:
            why = []
            for c in (best_top, mean_top):
                ss = sorted([score_artwork(w, EDS[eid]) for w in ALL[c]["artworks"]], reverse=True)
                why.append(f"{c}: melhor={ss[0]:.2f}, média3={sum(ss[:3]) / min(3, len(ss)):.2f}, n_obras={len(ss)}")
            discord.append({"edital": eid, "top_por_melhor_obra": best_top, "top_por_media3": mean_top,
                            "candidatos_multi_obra": len(cand_multi), "motivo": "; ".join(why)})
    print(f"discordância melhor-obra × média-3: {len(discord)} editais")
    for dd in discord:
        print("  ", dd["edital"], "->", dd["top_por_melhor_obra"], "vs", dd["top_por_media3"])

    separacao_aprovados = {}
    for eid in ED_ORDER:
        _, anchors_s, aprov_s = pool_of(eid)
        if len(aprov_s) < 2 or not anchors_s:
            continue
        sc = {}
        for cid in anchors_s + aprov_s:
            r = rank_artist_edital(ALL[cid], EDS[eid], weights=SPEC_WEIGHTS, null_mode="neutral", cap_on=True)
            sc[cid] = r["final"] if r["final"] is not None else -1.0
        best = max(sc[a] for a in anchors_s)
        rank = 1 + sum(1 for f in sc.values() if f > best)
        separacao_aprovados[eid] = {"rank_ancora": rank, "n_avaliados": len(aprov_s) + len(anchors_s)}
    print("separação entre aprovados: âncora no topo em",
          sum(1 for v in separacao_aprovados.values() if v["rank_ancora"] == 1), "/", len(separacao_aprovados), "editais")
    json.dump({"configs": results, "bootstrap_ci_v4": ci, "alpha_sweep": alpha_res,
               "separacao_aprovados": separacao_aprovados,
               "alpha_editais": multi_editais, "discordancia_melhor_media": discord,
               "multi_ids": MULTI_IDS, "multi2_ids": MULTI2_IDS},
              open(os.path.join(RES, "benchmark_v3.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("gravado results/benchmark_v3.json")
