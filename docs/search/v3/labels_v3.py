# -*- coding: utf-8 -*-
"""Rótulos 0-3 em dois passes independentes + kappa ponderado.
Passo A (rubrica estruturada): elegibilidade + correspondência de linguagem/conceito/técnica.
Passo B (cego): similaridade TF-IDF entre texto plano do artista e texto do edital.
Âncoras = rótulo 3 travado (tipo_rotulo: ganhador_real)."""
import json
import math
import os
import re
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "data_v3/dataset_v3_full.json"), encoding="utf-8"))
sys_path = HERE

ART = {a["id"]: a for a in D["artistas"]}
CAND = D["candidatos"]
EDS = D["editais"]
GT = D["gt"]
ALL = dict(ART)
ALL.update(CAND)


def tokens(text):
    text = unicodedata.normalize("NFKD", text.lower()).encode("ascii", "ignore").decode()
    toks = re.findall(r"[a-z0-9]{2,}", text)
    stop = {"de", "da", "do", "das", "dos", "e", "a", "o", "as", "os", "em", "no", "na", "para", "com",
            "por", "um", "uma", "que", "do", "ao", "os", "seu", "sua", "the", "of", "and"}
    return [t for t in toks if t not in stop and len(t) > 2]


def flat_artist(a):
    parts = [a.get("resume", ""), " ".join(a["languages_main"] + a["languages_secondary"]),
             " ".join(a.get("positioning", [])), " ".join(a["concepts"]["central"])]
    for w in a["artworks"]:
        parts += [w["title"], w.get("language", ""), w.get("descricao", "")]
    return " ".join(parts)


def flat_edital(e):
    langs = [v for r in e["artistic_requirements"]["languages"] for v in r["value"]]
    return " ".join([e["title"], e.get("description_text", ""), " ".join(langs)])


def tfidf_cos(a_text, e_text, idf):
    ta, te = tokens(a_text), tokens(e_text)
    if not ta or not te:
        return 0.0
    from collections import Counter
    ca, ce = Counter(ta), Counter(te)
    dot = sum(ca[t] * idf.get(t, 1.0) * ce[t] * idf.get(t, 1.0) for t in set(ca) & set(ce))
    na = math.sqrt(sum((ca[t] * idf.get(t, 1.0)) ** 2 for t in ca))
    ne = math.sqrt(sum((ce[t] * idf.get(t, 1.0)) ** 2 for t in ce))
    return dot / (na * ne) if na and ne else 0.0


def build_idf(pairs_texts):
    df = {}
    for t in pairs_texts:
        for tok in set(tokens(t)):
            df[tok] = df.get(tok, 0) + 1
    n = len(pairs_texts)
    return {t: math.log((1 + n) / (1 + c)) + 1.0 for t, c in df.items()}


def lang_base(artist, edital):
    from engine_v3 import lang_match
    core = [v for r in edital["artistic_requirements"]["languages"] if r.get("role", "core") == "core" for v in r["value"]]
    pool = artist["languages_main"] + artist["languages_secondary"]
    if not core or not pool:
        return 1 if (not core and pool) else None, 0.0
    best = max(lang_match(pool, v) for v in core)
    if best >= 1.0:
        return 2, best
    if best >= 0.3:
        return 1, best
    return 0, best


def label_A(artist, edital):
    from engine_v3 import check_eligibility, concept_match, req_values
    elig = check_eligibility(artist, edital)
    if elig["status"] == "INELIGIBLE":
        return 0, "inelegivel"
    base, best = lang_base(artist, edital)
    if base is None:
        return 1, "sem_dado"
    score = base
    concepts = req_values(edital["artistic_requirements"]["concepts"])
    if concepts:
        cen = artist["concepts"].get("central", [])
        if any(concept_match(artist["concepts"], v) >= 0.6 for v, s in concepts):
            score += 1
    tech = req_values(edital["artistic_requirements"].get("techniques", []))
    if tech:
        at = set()
        for w in artist["artworks"]:
            at.update(w.get("techniques", []))
        if any(v in at for v, s in tech):
            score += 1
    return min(score, 3), "rubrica"


def label_B(cos):
    if cos >= 0.30:
        return 3
    if cos >= 0.20:
        return 2
    if cos >= 0.10:
        return 1
    return 0


def quadratic_kappa(r1, r2, n=4):
    from collections import Counter
    o = Counter((r1[i], r2[i]) for i in range(len(r1)))
    tot = len(r1)
    w_mat = [[(i - j) ** 2 / (n - 1) ** 2 for j in range(n)] for i in range(n)]
    po = sum(o[(i, j)] * w_mat[i][j] for i in range(n) for j in range(n)) / tot
    e1 = [sum(o[(i, j)] for j in range(n)) / tot for i in range(n)]
    e2 = [sum(o[(i, j)] for i in range(n)) / tot for j in range(n)]
    pe = sum(e1[i] * e2[j] * w_mat[i][j] for i in range(n) for j in range(n))
    return 1 - po / pe if pe else 1.0


if __name__ == "__main__":
    anchors = GT["anchors"]
    excluded = GT["excluded"]
    aprov_add = GT["aprovados_adicionais"]
    cmap = D["candidacy_map"]
    prom_cand = D.get("candidacias_promovidos", {})
    ed_ids = [e["id"] for e in EDS]
    edmap = {e["id"]: e for e in EDS}

    # pares fora da linguagem (rótulo 0 explícito): 5 artistas de outra linguagem por edital
    outside_pairs = []
    lang_of = {}
    for a in ART.values():
        lang_of[a["id"]] = a["languages_main"][0] if a["languages_main"] else None
    for eid in ed_ids:
        e = edmap[eid]
        core = [v for r in e["artistic_requirements"]["languages"] if r.get("role", "core") == "core" for v in r["value"]]
        others = [aid for aid, lg in lang_of.items() if lg and lg not in core]
        for aid in others[:5]:
            outside_pairs.append((aid, eid))

    texts, pairs = [], []
    for eid in ed_ids:
        e = edmap[eid]
        pool = set()
        pool.update([x for x in anchors.get(eid, []) if x in ALL])
        pool.update([x for x in excluded.get(eid, []) if x in ALL])
        pool.update([x for x in aprov_add.get(eid, []) if x in ALL])
        for cid in cmap.get(eid, []):
            pool.add(cid)
        for pc in prom_cand.get(eid, []):
            pass  # promovidos entram via pools manuais abaixo
        # candidaturas de promovidos
        for aid, cand_list in prom_cand.items():
            for c in cand_list:
                if c["edital"] == eid:
                    pool.add(aid)
        for aid in pool:
            pairs.append((aid, eid))
    for aid, eid in outside_pairs:
        if aid in ALL and (aid, eid) not in pairs:
            pairs.append((aid, eid))
            pairs[-1] = (aid, eid)

    texts = [flat_artist(ALL[aid]) for aid, _ in pairs] + [flat_edital(edmap[eid]) for _, eid in pairs]
    idf = build_idf(texts)

    # cosines por edital para rotulagem relativa do avaliador B (cego ao resultado)
    cos_by_ed = {}
    for aid, eid in pairs:
        cos_by_ed.setdefault(eid, []).append(tfidf_cos(flat_artist(ALL[aid]), flat_edital(edmap[eid]), idf))
    import statistics as st
    quart = {}
    for eid, cos_list in cos_by_ed.items():
        cs = sorted(cos_list)
        if len(cs) >= 4:
            quart[eid] = (cs[len(cs) // 4], cs[len(cs) // 2], cs[3 * len(cs) // 4])
        else:
            quart[eid] = (0.05, 0.10, 0.15)
    def label_B_rel(cos, eid):
        p25, p50, p75 = quart[eid]
        if cos >= p75:
            return 3
        if cos >= p50:
            return 2
        if cos >= p25:
            return 1
        return 0

    labels = []
    for aid, eid in pairs:
        a, e = ALL[aid], edmap[eid]
        if aid in anchors.get(eid, []):
            la = 3
            tipo = "ganhador_real"
        elif aid in aprov_add.get(eid, []) or aid in excluded.get(eid, []):
            la = 3
            tipo = "aprovado_real"
        else:
            la, tipo = label_A(a, e)
            if (aid, eid) in outside_pairs:
                tipo = "fora_linguagem"
        cos = tfidf_cos(flat_artist(a), flat_edital(e), idf)
        lb = label_B_rel(cos, eid)
        situacao = a.get("situacao") if aid in CAND else None
        labels.append({"artista": aid, "edital": eid, "rotulo_A": la, "rotulo_B": lb,
                       "cos_tfidf": round(cos, 4), "tipo_rotulo": tipo,
                       "situacao": situacao, "par_fora_linguagem": (aid, eid) in outside_pairs})
    k = quadratic_kappa([l["rotulo_A"] for l in labels], [l["rotulo_B"] for l in labels])
    agree = sum(1 for l in labels if l["rotulo_A"] == l["rotulo_B"]) / len(labels)
    out = {"pares": labels, "kappa_ponderado": round(k, 4), "concordancia_simples": round(agree, 4),
           "n_pares": len(labels), "n_pares_fora_linguagem": sum(1 for l in labels if l["par_fora_linguagem"]),
           "n_rotulos_ganhador_real": sum(1 for l in labels if l["tipo_rotulo"] == "ganhador_real"),
           "n_rotulos_aprovado_real": sum(1 for l in labels if l["tipo_rotulo"] == "aprovado_real"),
           "nota": "Avaliador A = rubrica estruturada; Avaliador B = TF-IDF cego ao resultado, em escala relativa por edital (quartis do cosine). Âncoras e aprovados reais têm rótulo 3 travado."}
    json.dump(out, open(os.path.join(HERE, "results/rotulos_v3.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"pares: {len(labels)} | kappa ponderado: {k:.4f} | concordância: {agree:.4f}")
    print("ganhador_real:", out["n_rotulos_ganhador_real"], "| aprovado_real:", out["n_rotulos_aprovado_real"],
          "| fora_linguagem:", out["n_pares_fora_linguagem"])
