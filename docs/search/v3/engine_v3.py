# -*- coding: utf-8 -*-
"""ArtistRank motor v3 — implementação fiel da seção 6 do mandato da v3.

Diferenças explícitas vs motor da v2:
1. Portfólio: média das 3 MELHORES obras (v2 usava 2).
2. Combinação 0,35 artista + 0,65 portfólio UNIFORME (v2 usava 0,60/0,40 em fomento).
3. Teto de 45 só quando requisito artístico explícito obrigatório está em FAIL com o
   campo do perfil PREENCHIDO; campo vazio = UNKNOWN e NÃO ativa o teto.
4. Linguagem core obrigatória casa apenas com linguagens_main (núcleo); casar só pela
   languages_secondary (suporte) = FAIL.
5. v0: nulo = 0 com denominador cheio (sem renormalizar removendo o fator).
"""
import math
import re

LANGUAGE_PARENTS = {
    "fotografia": "artes_visuais", "pintura": "artes_visuais", "gravura": "artes_visuais",
    "escultura": "artes_visuais", "instalacao": "artes_visuais", "performance": "artes_cenicas",
    "arte_digital": "artes_visuais", "videoarte": "artes_visuais", "artes_urbanas": "artes_visuais",
    "artes_digitais": "artes_visuais", "cinema": "audiovisual", "documentario": "audiovisual",
    "video": "audiovisual", "videodanca": "danca", "contacao_historia": "literatura",
    "animacao": "audiovisual", "patrimonio_cultural": "patrimonio", "moda": "artes_visuais",
    "artesanato": "artes_visuais", "gastronomia": "patrimonio", "rap": "musica",
}
SIBLINGS = {
    "artes_visuais": {"fotografia", "pintura", "gravura", "escultura", "instalacao", "arte_digital",
                      "videoarte", "artes_urbanas", "artes_digitais", "moda", "artesanato"},
    "artes_cenicas": {"teatro", "danca", "circo", "performance"},
}
PARTIAL_SYNONYMS = {("contemporaneidade", "cidade"), ("cidade", "contemporaneidade"),
                    ("memoria", "patrimonio"), ("patrimonio", "memoria"),
                    ("territorio", "pertencimento"), ("pertencimento", "territorio"),
                    ("ancestralidade", "cultura_popular"), ("cultura_popular", "ancestralidade"),
                    ("afetividade", "corpo"), ("corpo", "afetividade"),
                    ("politica", "trabalho"), ("violencia", "politica")}
TERRITORY_LEVELS = {"city_recife": 2, "metro_recife": 1, "state_pe": 0}
STRENGTH_W = {"explicit_mandatory": 1.0, "preference": 0.7, "undeclared": 0.0}
SPEC_WEIGHTS = {"L": 0.15, "C": 0.20, "T": 0.10, "P": 0.15, "H": 0.10, "O": 0.15, "G": 0.05, "V": 0.10}
EQUAL_WEIGHTS = {k: 0.125 for k in SPEC_WEIGHTS}


def lang_match(artist_langs, req_lang):
    if req_lang in artist_langs:
        return 1.0
    parent = LANGUAGE_PARENTS.get(req_lang, req_lang)
    for a in artist_langs:
        if LANGUAGE_PARENTS.get(a) == req_lang or LANGUAGE_PARENTS.get(req_lang) == a:
            return 0.6
        if LANGUAGE_PARENTS.get(a) == parent and parent != a:
            return 0.3
        if a in SIBLINGS.get(parent, set()) and req_lang in SIBLINGS.get(parent, set()):
            return 0.3
    return 0.0


def concept_match(artist_concepts, req_concept):
    if req_concept in artist_concepts.get("central", []):
        return 1.0
    if req_concept in artist_concepts.get("secondary", []):
        return 0.6
    for group in ("central", "secondary"):
        for c in artist_concepts.get(group, []):
            if (c, req_concept) in PARTIAL_SYNONYMS:
                return 0.4
    return 0.0


def req_values(req_list):
    out = []
    for r in req_list or []:
        for v in r["value"]:
            out.append((v, r["strength"]))
    return out


# ---------------------------------------------------------------- elegibilidade

def check_eligibility(artist, edital):
    results = []
    for rule in edital["eligibility"]:
        rtype, value, strength = rule["type"], rule["value"], rule.get("strength", "explicit_mandatory")
        status = "NOT_APPLICABLE"
        if rtype == "territory":
            if not artist.get("territory") or artist["territory"] not in TERRITORY_LEVELS:
                status = "UNKNOWN"
            else:
                status = "PASS" if TERRITORY_LEVELS[artist["territory"]] >= TERRITORY_LEVELS[value] else "FAIL"
        elif rtype == "min_activity_years":
            if artist.get("years_active") is None:
                status = "UNKNOWN"
            else:
                status = "PASS" if artist["years_active"] >= value else "FAIL"
        elif rtype == "person_type":
            pt = artist.get("person_type")
            status = "UNKNOWN" if not pt else ("PASS" if pt in value else "FAIL")
        elif rtype == "formacao":
            f = artist.get("formacao")
            status = "UNKNOWN" if not f else ("PASS" if f in value else "FAIL")
        elif rtype == "self_declared":
            ok = any(p in ("periferica", "comunitaria", "popular") for p in artist.get("positioning", []))
            status = "PASS" if ok else ("UNKNOWN" if not artist.get("positioning") else "FAIL")
        elif rtype == "docs":
            status = "PASS" if artist.get("availability", {}).get("documentacao_completa") else "UNKNOWN"
        results.append({"rule": rtype, "value": value, "status": status})
    fails = [r for r in results if r["status"] == "FAIL"]
    unknowns = [r for r in results if r["status"] == "UNKNOWN"]
    overall = "INELIGIBLE" if fails else ("PENDING" if unknowns else "ELIGIBLE")
    return {"status": overall, "checks": results, "fails": [r["rule"] for r in fails],
            "unknowns": [r["rule"] for r in unknowns]}


# ---------------------------------------------------------------- fatores

def score_language(artist, edital):
    rules = edital["artistic_requirements"]["languages"]
    if not rules:
        return None
    if not artist["languages_main"] and not artist["languages_secondary"]:
        return None  # campo vazio = sem dado (UNKNOWN): fator None, sem teto
    core, sup = [], []
    for r in rules:
        vals = [(v, r["strength"]) for v in r["value"]]
        (core if r.get("role", "core") == "core" else sup).extend(vals)

    def group_score(vals, lang_pool):
        # valores dentro da MESMA regra são alternativas aceitas (any-of -> máximo),
        # não requisitos cumulativos; a média derrubaria ganhadores em editais
        # multilinguagem (ex.: circo em lista de 14 linguagens aceitas)
        if not vals or not lang_pool:
            return None
        return max(lang_match(lang_pool, v) for v, _ in vals)

    c_score = group_score(core, artist["languages_main"]) if core else None
    s_score = group_score(sup, artist["languages_main"] + artist["languages_secondary"]) if sup else None
    if core and sup:
        return 0.75 * c_score + 0.25 * s_score
    if core:
        return c_score
    return s_score


def score_concepts(artist, edital):
    vals = req_values(edital["artistic_requirements"]["concepts"])
    if not vals:
        return None
    num = den = 0.0
    for v, s in vals:
        w = STRENGTH_W[s]
        num += w * concept_match(artist["concepts"], v)
        den += w
    return num / den if den else None


def score_positioning(artist, edital):
    vals = req_values(edital["artistic_requirements"]["positioning"])
    if not vals:
        return None
    pos = set(artist["positioning"])
    num = den = 0.0
    for v, s in vals:
        w = STRENGTH_W[s]
        num += w * (1.0 if v in pos else 0.0)
        den += w
    return num / den if den else None


def score_technique(artist, edital):
    tech_vals = req_values(edital["artistic_requirements"].get("techniques", []))
    sup_vals = req_values(edital["artistic_requirements"].get("supports", []))
    declared = [v for v, s in tech_vals + sup_vals if s != "undeclared"]
    if not declared:
        return None
    artist_t = set()
    for w in artist["artworks"]:
        artist_t.update(w["techniques"] + w["supports"])
    return sum(1 for d in declared if d in artist_t) / len(declared)


def score_trajectory(artist, edital):
    traj = artist["trajectory"]
    if not traj:
        return None
    ed_langs = [v for v, s in req_values(edital["artistic_requirements"]["languages"])]
    rel, n = 0.0, 0
    for exp in traj:
        area = exp.get("relevancia_area", "")
        m = 0.0
        if any(lang_match([area], l) > 0 for l in ed_langs):
            m = 1.0
        elif area == "producao" and edital["opportunity_type"] in ("formacao", "financiamento_projetos"):
            m = 0.6
        elif area == "arte_educacao" and edital["opportunity_type"] == "formacao":
            m = 1.0
        comp = {"verified": 1.0, "partial": 0.6, "declared": 0.3}[exp["comprovacao"]]
        rel += (0.7 * m + 0.3) * comp
        n += 1
    relevancia = rel / n
    verified = sum(1 for e in traj if e["comprovacao"] == "verified") / len(traj)
    tempo = min(1.0, (artist.get("years_active") or 0) / 15.0)
    return 0.5 * relevancia + 0.3 * verified + 0.2 * tempo


def score_artwork(w, edital):
    rules = edital["artistic_requirements"]["languages"]
    core_langs = [x for r in rules if r.get("role", "core") == "core" for x in r["value"]]
    ed_langs = core_langs if core_langs else [v for v, s in req_values(rules)]
    ed_concepts = req_values(edital["artistic_requirements"]["concepts"])
    l = max([lang_match([w["language"]], l2) for l2 in ed_langs], default=0.0) if ed_langs else 0.6
    if ed_concepts:
        num = den = 0.0
        for v, s in ed_concepts:
            sw = STRENGTH_W[s]
            num += sw * concept_match({"central": w["concepts"], "secondary": []}, v)
            den += sw
        c = num / den if den else 0.5
    else:
        c = 0.5
    ftype = edital["opportunity_type"]
    feas = 0.8
    if ftype in ("premiacao_ocupacao_expositiva", "aquisicao_obras", "programacao_festival"):
        if w["availability"] == "obras_prontas" or w["availability"] == "obra_pronta":
            feas = 1.0
        elif w["availability"] == "obra_inedita":
            feas = 0.9 if edital.get("proposal_requirements", {}).get("unpublished_preferred") else 0.7
        elif w["availability"] == "projeto_novo":
            feas = 0.5
    elif ftype in ("formacao", "fomento_projetos", "financiamento_projetos", "fomento_pesquisa"):
        feas = 1.0 if w["availability"] == "projeto_novo" else 0.8
    return 0.35 * l + 0.35 * c + 0.20 * feas + 0.10 * 0.8


def score_work_portfolio(artist, edital, alpha=0.6):
    scores = sorted([score_artwork(w, edital) for w in artist["artworks"]], reverse=True)
    if not scores:
        return None
    top3 = scores[:3]
    return alpha * top3[0] + (1 - alpha) * (sum(top3) / len(top3))


def score_territory_public(artist, edital):
    terr_rule = next((r for r in edital["eligibility"] if r["type"] == "territory"), None)
    terr = None
    if terr_rule and artist.get("territory") in TERRITORY_LEVELS:
        terr = 1.0 if TERRITORY_LEVELS[artist["territory"]] >= TERRITORY_LEVELS[terr_rule["value"]] else 0.0
    pub_fit = 0.5
    pos = set(artist["positioning"])
    niches = set(artist["niches"])
    ed_pos = [v for v, s in req_values(edital["artistic_requirements"]["positioning"])]
    ed_niches = [v for v, s in req_values(edital["artistic_requirements"]["niches"])]
    if ed_pos:
        pub_fit = 0.5 + 0.5 * (1 if pos & set(ed_pos) else 0)
    if ed_niches:
        pub_fit = (pub_fit + (1.0 if niches & set(ed_niches) else 0.0)) / 2
    if terr is None:
        return None
    return 0.6 * terr + 0.4 * pub_fit


def score_feasibility(artist, edital):
    avail = artist["availability"]
    viol = 0
    fmt = edital.get("proposal_requirements", {}).get("exhibition_formats", [])
    ftype = edital["opportunity_type"]
    needs_install = any("exhibition" in f or "aquisicao" in f for f in fmt) or ftype in (
        "premiacao_ocupacao_expositiva", "aquisicao_obras")
    needs_prod = ftype in ("fomento_projetos", "financiamento_projetos", "formacao")
    if needs_prod and not avail.get("equipe"):
        viol += 1
    if not avail.get("documentacao_completa", True):
        viol += 1
    if needs_install and not any(w["availability"] in ("obras_prontas", "obra_pronta", "producao_parcial")
                                 for w in artist["artworks"]):
        viol += 1
    return max(0.0, 1.0 - 0.25 * viol)


# ---------------------------------------------------------------- score geral

def weighted_score(factors, weights, null_mode="neutral"):
    """null_mode: 'zero' (nulo=0, denominador cheio — v0/v2) ou 'neutral' (nulo=0,5 — v4)."""
    num = den = 0.0
    for k, w in weights.items():
        v = factors.get(k)
        if v is None:
            v = 0.0 if null_mode == "zero" else 0.5
        num += w * v
        den += w
    return num / den if den else None


def _cap_check(artist, edital):
    """Teto 45: requisito artístico EXPLÍCITO OBRIGATÓRIO em FAIL com campo PREENCHIDO.
    Campo vazio = UNKNOWN -> sem teto. Requisitos preference nunca ativam teto."""
    caps = []
    reqs = edital["artistic_requirements"]
    main = artist["languages_main"]
    for r in reqs["languages"]:
        if r["strength"] != "explicit_mandatory" or r.get("role", "core") != "core":
            continue
        if not main:  # campo vazio -> UNKNOWN, sem teto
            continue
        # casa só com core (main); casar apenas pelo suporte = FAIL
        if not any(lang_match(main, v) > 0 for v in r["value"]):
            caps.append(45.0)
    for field, key in (("positioning", "positioning"), ("niches", "niches")):
        for r in reqs.get(field, []):
            if r["strength"] != "explicit_mandatory":
                continue
            artist_vals = set(artist[key])
            if not artist_vals:
                continue
            if not set(r["value"]) & artist_vals:
                caps.append(45.0)
    for r in reqs.get("concepts", []):
        if r["strength"] != "explicit_mandatory":
            continue
        artist_c = artist["concepts"].get("central", []) + artist["concepts"].get("secondary", [])
        if not artist_c:
            continue
        if not any(concept_match(artist["concepts"], v) > 0 for v in r["value"]):
            caps.append(45.0)
    return min(caps) if caps else None


def rank_artist_edital(artist, edital, weights=None, alpha=0.6, null_mode="neutral", cap_on=True):
    weights = weights or SPEC_WEIGHTS
    elig = check_eligibility(artist, edital)
    if elig["status"] == "INELIGIBLE":
        return {"artist": artist["id"], "edital": edital["id"], "eligibility": elig["status"],
                "elig_fails": elig["fails"], "elig_unknowns": elig["unknowns"], "final": None,
                "final_raw": None, "cap": None, "blocked": True, "confidence": None}
    factors = {
        "L": score_language(artist, edital),
        "C": score_concepts(artist, edital),
        "T": score_technique(artist, edital),
        "P": score_positioning(artist, edital),
        "H": score_trajectory(artist, edital),
        "G": score_territory_public(artist, edital),
        "V": score_feasibility(artist, edital),
        "O": score_work_portfolio(artist, edital, alpha),
    }
    artist_score = weighted_score({k: factors[k] for k in weights}, weights, null_mode)
    final = 100 * (0.35 * (artist_score or 0.0) + 0.65 * (factors["O"] or 0.0))
    cap = _cap_check(artist, edital) if cap_on else None
    final_capped = min(final, cap) if cap is not None else final
    cov = sum(1 for v in factors.values() if v is not None) / len(factors)
    conf = 100 * (0.35 * artist["coverage"]["campos_preenchidos"]
                  + 0.30 * artist["coverage"]["qualidade_evidencias"]
                  + 0.15 * artist["coverage"]["atualidade"]
                  + 0.20 * artist["coverage"]["confianca_extracao"])
    return {"artist": artist["id"], "edital": edital["id"], "eligibility": elig["status"],
            "elig_fails": elig["fails"], "elig_unknowns": elig["unknowns"],
            "factors": factors, "artist_score": artist_score, "portfolio_score": factors["O"],
            "final": final_capped, "final_raw": final, "cap": cap, "blocked": False,
            "coverage": cov, "confidence": conf}
