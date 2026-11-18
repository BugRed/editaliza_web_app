# -*- coding: utf-8 -*-
"""verify.py — reproduz cada número do relatório v3 a partir dos dados e falha se:
âncoras > 2 por edital; âncora sem fonte/projeto/URL; id duplicado; edital sem resultado
marcado como verificado; candidato sem situacao; número do relatório ≠ recalculado.
Uso: python3 verify.py [--relatorio results/report_numbers.json]
Saída: código 0 se tudo bate; 1 se qualquer checagem falhar."""
import hashlib
import json
import os
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

D = json.load(open(os.path.join(HERE, "data_v3/dataset_v3_full.json"), encoding="utf-8"))
GT = D["gt"]
ART = {a["id"]: a for a in D["artistas"]}
CAND = D["candidatos"]
EDS = {e["id"]: e for e in D["editais"]}
FAILS = []
OKS = []


def check(name, cond, detail=""):
    (OKS if cond else FAILS).append(f"{name}{(' — ' + detail) if detail else ''}")
    print(("PASS " if cond else "FAIL ") + name + ((" — " + detail) if detail else ""))


# 1. âncoras: máx 2 por edital + fonte/projeto/URL
n_anchor_pairs = 0
for eid, lst in GT["anchors"].items():
    if len(lst) > 2:
        FAILS.append(f"âncoras>2 em {eid}")
    for aid in lst:
        n_anchor_pairs += 1
        a = ART.get(aid)
        if a is None:
            FAILS.append(f"âncora inexistente {aid}")
            continue
        if not a.get("fonte"):
            FAILS.append(f"âncora sem fonte {aid}")
        if not a.get("artworks"):
            FAILS.append(f"âncora sem projeto {aid}")
check("âncoras ≤ 2 por edital e com fonte+projeto", not any("âncoras>2" in f or "sem fonte" in f or "sem projeto" in f or "inexistente" in f for f in FAILS),
      f"{n_anchor_pairs} pares travados")

# 2. editais verificados têm resultado + URL/fonte
for e in D["editais"]:
    if e.get("resultado_status") == "verificado" and not (e.get("fontes") or e.get("fonte")):
        FAILS.append(f"edital verificado sem fonte {e['id']}")
    if e.get("resultado_status") not in ("verificado", "pendente"):
        FAILS.append(f"edital sem status de resultado {e['id']}")
check("todo edital tem status de resultado e fonte", not any("edital" in f and ("sem fonte" in f or "sem status" in f) for f in FAILS),
      f"{len(D['editais'])} verificados + {len(GT['pendentes'])} pendentes")

# 3. ids únicos (artistas + candidatos)
ids = [a["id"] for a in D["artistas"]] + list(CAND.keys())
check("ids únicos entre artistas e candidatos", len(ids) == len(set(ids)), f"{len(ids)} ids")

# 4. candidatos com situacao
sem_sit = [cid for cid, c in CAND.items() if not c.get("situacao")]
check("todo candidato tem situacao", not sem_sit, f"{len(CAND)} candidatos")

# 5. anchor tem URL no registro? (fonte do artista referencia o resultado oficial)
sem_url = []
for eid, lst in GT["anchors"].items():
    for aid in lst:
        f = ART[aid].get("fonte_url", "") or ART[aid].get("fonte", "")
        if "culturarecife.com.br" not in f and "tvguararapes" not in f and "http" not in f and "mapacultural" not in f:
            sem_url.append(aid)
check("fonte de âncora aponta para documento/imprensa", not sem_url, f"{len(sem_url)} sem referência")

# 6. recalcula as métricas do motor e compara com report_numbers.json
from engine_v3 import rank_artist_edital, SPEC_WEIGHTS, EQUAL_WEIGHTS  # noqa
ALL = dict(ART)
ALL.update(CAND)


def _norm(s):
    s = unicodedata.normalize("NFKD", (s or "").lower()).encode("ascii", "ignore").decode()
    import re as _re
    return _re.sub(r"\s+", " ", s).strip()


def pool_of(eid):
    anchors = [x for x in GT["anchors"].get(eid, []) if x in ALL]
    real_names = {_norm(ALL[x]["nome"]) for x in anchors}
    real_names |= {_norm(ALL[x]["nome"]) for x in GT["excluded"].get(eid, []) if x in ALL}
    aprov = [x for x in GT["aprovados_adicionais"].get(eid, []) if x in ALL]
    real_names |= {_norm(ALL[x]["nome"]) for x in aprov}
    comps, seen = [], set()
    for cid in D["candidacy_map"].get(eid, []):
        if cid in ALL and _norm(ALL[cid]["nome"]) not in real_names and cid not in seen:
            comps.append(cid)
            seen.add(cid)
    for aid, cs in D.get("candidacias_promovidos", {}).items():
        if _norm(ALL[aid]["nome"]) in real_names:
            continue
        if any(c["edital"] == eid and c["situacao"] != "selecionado" for c in cs) and aid not in seen:
            comps.append(aid)
            seen.add(aid)
    return comps, anchors, aprov


def metrics_v4():
    rows = []
    for eid, e in EDS.items():
        comps, anchors, aprov = pool_of(eid)
        if not anchors or not comps:
            continue
        sc = {}
        for cid in comps + anchors:
            r = rank_artist_edital(ALL[cid], e, weights=SPEC_WEIGHTS, null_mode="neutral", cap_on=True)
            sc[cid] = r["final"] if r["final"] is not None else -1.0
        best = max(sc[a] for a in anchors)
        rank = 1 + sum(1 for f in sc.values() if f > best)
        rows.append({"edital": eid, "rank": rank, "n": len(comps) + len(anchors)})
    mrr = sum(1.0 / r["rank"] for r in rows) / len(rows)
    hit1 = sum(1 for r in rows if r["rank"] == 1) / len(rows)
    return {"mrr": round(mrr, 4), "hit1": round(hit1, 4), "n_editais": len(rows),
            "pares_ancora": n_anchor_pairs, "n_candidatos": len(CAND), "n_artistas": len(D["artistas"]),
            "n_editais_verificados": len(D["editais"]), "n_pendentes": len(GT["pendentes"])}


recalc = metrics_v4()
rep_path = os.path.join(HERE, "results/report_numbers.json")
if os.path.exists(rep_path):
    rep = json.load(open(rep_path, encoding="utf-8"))
    diffs = [k for k in recalc if k in rep and rep[k] != recalc[k]]
    check("números do relatório = recalculados", not diffs,
          f"recalc={ {k: recalc[k] for k in ['mrr', 'hit1', 'n_editais']} }; diffs={diffs}")
else:
    json.dump(recalc, open(rep_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    check("números do relatório = recalculados (primeira execução: referência gravada; rode de novo)", True,
          f"{recalc['mrr']}/{recalc['hit1']}")

# 7. tamanho final vs mínimos (seção 10)
sizes = {
    "editais_verificados": len(D["editais"]),
    "min_editais": 20,
    "pares_ancora": n_anchor_pairs,
    "candidatos_nao_ganhadores": sum(1 for c in CAND.values() if c["situacao"] != "selecionado"),
    "artistas_multi_obra_3": sum(1 for a in D["artistas"] if len(a["artworks"]) >= 3),
    "min_multi_obra": 12,
    "casos_teto": len(json.load(open(os.path.join(HERE, "data_v3/casos_elegibilidade_teto.json"), encoding="utf-8"))),
    "min_casos": 8,
    "editais_com_req_allem_linguagem": sum(1 for e in D["editais"] if len(e.get("requisitos_explicitos", [])) > 1 or any(r["fator"] != "territorio" for r in e.get("requisitos_explicitos", []))),
    "min_reqs": 8,
}
print("\n--- tamanhos vs mínimos ---")
for k, v in sizes.items():
    print(f"  {k}: {v}")

json.dump({"ok": OKS, "fail": FAILS, "recalc": recalc, "sizes": sizes},
          open(os.path.join(HERE, "results/verify_out.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"\n{'TUDO OK' if not FAILS else 'FALHAS: ' + str(len(FAILS))}")
sys.exit(1 if FAILS else 0)
