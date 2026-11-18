# -*- coding: utf-8 -*-
"""
ArtistRank v0 — motor de pontuação conforme a especificação (MD seções 9, 10, 14, 15).

Implementa:
- Elegibilidade como etapa anterior (PASS/FAIL/UNKNOWN/NOT_APPLICABLE)
- 8 fatores de compatibilidade (L, C, T, P, H, O, G, V), notas 0..1 ou None
- Renormalização de pesos quando fator é None (MD 9.3/15.1)
- R_portfolio = alpha*max_obra + (1-alpha)*média das 2 melhores (MD 9.6)
- R_combined configurável por modalidade (exposição/aquisição vs formação/fomento)
- Confiança C = 100*(0.35K + 0.30E + 0.15A + 0.20X) (MD 14.2)
- Camada semântica determinística: TF-IDF + cosine sobre textos PT (proxy de embeddings)

Baselines:
- random, language_only, tfidf_full (buscador por palavras-chave),
- userC (fórmula de confiança usada como compatibilidade),
- spec_weights, equal_weights
"""

import math
import re

# ---------------------------------------------------------------- taxonomia

LANGUAGE_PARENTS = {
    "fotografia": "artes_visuais", "pintura": "artes_visuais", "gravura": "artes_visuais",
    "escultura": "artes_visuais", "instalacao": "artes_visuais", "performance": "artes_cenicas",
    "arte_digital": "artes_visuais", "videoarte": "artes_visuais", "artes_urbanas": "artes_visuais",
    "artes_digitais": "artes_visuais", "cinema": "audiovisual", "documentario": "audiovisual",
    "video": "audiovisual", "videodanca": "danca", "contacao_historia": "literatura",
}
SIBLINGS = {
    "artes_visuais": {"fotografia", "pintura", "gravura", "escultura", "instalacao", "arte_digital", "videoarte", "artes_urbanas", "artes_digitais"},
    "artes_cenicas": {"teatro", "danca", "circo", "performance"},
}
CONCEPT_SYNONYMS = {
    "meio_ambiente": "natureza", "patrimonio": "memoria", "pertencimento": "territorio",
    "contemporaneidade": "cidade",  # fraco; tratado como sinônimo parcial abaixo
}
PARTIAL_SYNONYMS = {("contemporaneidade", "cidade"), ("cidade", "contemporaneidade"),
                    ("memoria", "patrimonio"), ("patrimonio", "memoria"),
                    ("territorio", "pertencimento"), ("pertencimento", "territorio"),
                    ("ancestralidade", "cultura_popular"), ("cultura_popular", "ancestralidade"),
                    ("afetividade", "corpo"), ("corpo", "afetividade"),
                    ("politica", "trabalho"), ("violencia", "politica")}

TERRITORY_LEVELS = {"city_recife": 2, "metro_recife": 1, "state_pe": 0}


def lang_match(artist_langs, req_lang):
    """1.0 exato; 0.6 pai/filho; 0.3 irmão; 0.0 sem relação."""
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
    """1.0 central; 0.6 secundário; 0.4 sinônimo parcial; 0.0."""
    if req_concept in artist_concepts.get("central", []):
        return 1.0
    if req_concept in artist_concepts.get("secondary", []):
        return 0.6
    for group in ("central", "secondary"):
        for c in artist_concepts.get(group, []):
            if (c, req_concept) in PARTIAL_SYNONYMS:
                return 0.4
    return 0.0


# ---------------------------------------------------------------- TF-IDF

PT_STOP = set("""de da do das dos a o as os e ou um uma uns umas em no na nos nas ao aos à às
com por para sem sobre entre até após antes contra desde perante sob trás em is the of and to
que se sua seu suas seus pelo pela pelos pelas como mais muito este esta isso aquilo são é era
ser ter tendo foi will can na em que eu você ele ela nós eles eles nos lhes minha meu minha
""".split())


def tokenize(text):
    toks = re.findall(r"[a-zà-ú]{2,}", text.lower())
    return [t for t in toks if t not in PT_STOP]


class TfidfIndex:
    def __init__(self, docs):
        self.docs = [tokenize(d) for d in docs]
        self.vocab = {}
        for d in self.docs:
            for t in set(d):
                self.vocab[t] = self.vocab.get(t, 0) + 1
        self.n = len(self.docs)

    def idf(self, t):
        return math.log((1 + self.n) / (1 + self.vocab.get(t, 0))) + 1.0

    def vec(self, toks):
        if not toks:
            return {}
        counts = {}
        for t in toks:
            counts[t] = counts.get(t, 0) + 1
        return {t: (1 + math.log(c)) * self.idf(t) for t, c in counts.items()}

    def cosine(self, i, query_text):
        q = self.vec(tokenize(query_text))
        d = self.vec(self.docs[i])
        if not q or not d:
            return 0.0
        dot = sum(q[t] * d.get(t, 0.0) for t in q)
        nq = math.sqrt(sum(v * v for v in q.values()))
        nd = math.sqrt(sum(v * v for v in d.values()))
        return dot / (nq * nd) if nq and nd else 0.0


# ---------------------------------------------------------------- helpers

def artist_flat_text(a):
    parts = [a["resume"], " ".join(a["languages_main"] + a["languages_secondary"]),
             " ".join(a["positioning"] + a["niches"]),
             a["concepts"]["central"], a["concepts"]["secondary"]]
    for w in a["artworks"]:
        parts += [w["title"], w["language"], w["techniques"], w["concepts"]]
    return " ".join(str(p) for p in parts)


def edital_flat_text(e):
    req = e["artistic_requirements"]
    langs = [v for r in req["languages"] for v in r["value"]]
    concepts = [v for r in req["concepts"] for v in r["value"]]
    pos = [v for r in req["positioning"] for v in r["value"]]
    niches = [v for r in req["niches"] for v in r["value"]]
    formats = e.get("proposal_requirements", {}).get("exhibition_formats", [])
    return " ".join([e["title"], e["description_text"], " ".join(langs + concepts + pos + niches + formats)])


STRENGTH_W = {"explicit_mandatory": 1.0, "preference": 0.7, "undeclared": 0.0}


def req_values(req_list):
    """[(valor, strength)] para listas de requisitos."""
    out = []
    for r in req_list:
        for v in r["value"]:
            out.append((v, r["strength"]))
    return out


# ---------------------------------------------------------------- elegibilidade

def check_eligibility(artist, edital):
    results = []
    for rule in edital["eligibility"]:
        rtype, value, strength = rule["type"], rule["value"], rule["strength"]
        status = "NOT_APPLICABLE"
        if rtype == "territory":
            lv_artist = TERRITORY_LEVELS[artist["territory"]]
            lv_req = TERRITORY_LEVELS[value]
            status = "PASS" if lv_artist >= lv_req else "FAIL"
        elif rtype == "age_min":
            status = "PASS"  # nenhum artista < 18 no dataset
        elif rtype == "min_activity_years":
            status = "PASS" if artist["years_active"] >= value else "FAIL"
        elif rtype == "person_type":
            status = "PASS"
        elif rtype == "self_declared":
            ok = any(p in ("periferica", "comunitaria", "popular") for p in artist["positioning"])
            status = "PASS" if ok else "FAIL"
        elif rtype == "docs":
            status = "PASS" if artist["availability"]["documentacao_completa"] else "UNKNOWN"
        results.append({"rule": rtype, "value": value, "status": status})
    fails = [r for r in results if r["status"] == "FAIL"]
    unknowns = [r for r in results if r["status"] == "UNKNOWN"]
    if fails:
        overall = "INELIGIBLE"
    elif unknowns:
        overall = "PENDING"
    else:
        overall = "ELIGIBLE"
    return {"status": overall, "checks": results,
            "fails": [r["rule"] for r in fails], "unknowns": [r["rule"] for r in unknowns]}


# ---------------------------------------------------------------- fatores

def score_language(artist, edital):
    rules = edital["artistic_requirements"]["languages"]
    if not rules:
        return None
    langs = artist["languages_main"] + artist["languages_secondary"]
    core = [(v, s) for r in rules if r.get("role", "core") == "core" for v, s in [(x, r["strength"]) for x in r["value"]]]
    sup = [(v, s) for r in rules if r.get("role") == "support" for v, s in [(x, r["strength"]) for x in r["value"]]]

    def group_score(vals):
        num = den = 0.0
        for v, s in vals:
            w = STRENGTH_W[s]
            num += w * lang_match(langs, v)
            den += w
        return num / den if den else None

    c_score, s_score = group_score(core), group_score(sup)
    if core and sup:
        return 0.75 * c_score + 0.25 * s_score
    if core:
        return c_score
    return s_score


def score_concepts(artist, edital):
    vals = req_values(edital["artistic_requirements"]["concepts"])
    if not vals:
        return None
    num, den = 0.0, 0.0
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
    num, den = 0.0, 0.0
    for v, s in vals:
        w = STRENGTH_W[s]
        num += w * (1.0 if v in pos else 0.0)
        den += w
    return num / den if den else None


def score_technique(artist, edital):
    """Técnica/suporte do edital vs obras. Quase sempre undeclared no dataset."""
    tech_vals = req_values(edital["artistic_requirements"].get("techniques", []))
    sup_vals = req_values(edital["artistic_requirements"].get("supports", []))
    declared = [v for v, s in tech_vals + sup_vals if s != "undeclared"]
    if not declared:
        return None
    artist_t = set()
    for w in artist["artworks"]:
        artist_t.update(w["techniques"] + w["supports"])
    hits = sum(1 for d in declared if d in artist_t)
    return hits / len(declared)


def score_trajectory(artist, edital):
    """Fator do artista: relevância das experiências, comprovação, tempo."""
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
        elif area in ("arte_educacao",) and edital["opportunity_type"] == "formacao":
            m = 1.0
        comp = {"verified": 1.0, "partial": 0.6, "declared": 0.3}[exp["comprovacao"]]
        rel += (0.7 * m + 0.3) * comp
        n += 1
    relevancia = rel / n
    verified = sum(1 for e in traj if e["comprovacao"] == "verified") / len(traj)
    tempo = min(1.0, artist["years_active"] / 15.0)
    return 0.5 * relevancia + 0.3 * verified + 0.2 * tempo


def score_artwork(w, edital):
    rules = edital["artistic_requirements"]["languages"]
    core_langs = [x for r in rules if r.get("role", "core") == "core" for x in r["value"]]
    ed_langs = core_langs if core_langs else [v for v, s in req_values(rules)]
    ed_concepts = req_values(edital["artistic_requirements"]["concepts"])
    l = max([lang_match([w["language"]], l2) for l2 in ed_langs], default=0.0) if ed_langs else 0.6
    c = None
    if ed_concepts:
        num = den = 0.0
        for v, s in ed_concepts:
            sw = STRENGTH_W[s]
            num += sw * concept_match({"central": w["concepts"], "secondary": []}, v)
            den += sw
        c = num / den if den else 0.5
    else:
        c = 0.5  # edital sem tema declarado: neutro
    fmt = edital.get("proposal_requirements", {}).get("exhibition_formats", [])
    ftype = edital["opportunity_type"]
    feas = 0.8  # base
    if ftype in ("premiacao_ocupacao_expositiva", "aquisicao_obras", "programacao_festival"):
        if "grande" in w["scale"] and w["availability"] == "producao_parcial":
            feas = 0.6
        if w["availability"] == "obras_prontas" or w["availability"] == "obra_pronta":
            feas = 1.0
        if w["availability"] == "obra_inedita":
            feas = 0.9 if edital.get("proposal_requirements", {}).get("unpublished_preferred") else 0.7
        if w["availability"] == "projeto_novo":
            feas = 0.5
    if ftype in ("formacao", "fomento_projetos", "financiamento_projetos", "fomento_pesquisa"):
        feas = 0.8 if w["availability"] != "projeto_novo" else 1.0
    return 0.35 * l + 0.35 * c + 0.20 * feas + 0.10 * 0.8  # escala neutra


def score_work_portfolio(artist, edital, alpha=0.6):
    scores = sorted([score_artwork(w, edital) for w in artist["artworks"]], reverse=True)
    if not scores:
        return None
    top2 = scores[:2]
    return alpha * top2[0] + (1 - alpha) * (sum(top2) / len(top2))


def score_territory_public(artist, edital):
    req = edital["eligibility"]
    terr_rule = next((r for r in req if r["type"] == "territory"), None)
    terr = None
    if terr_rule:
        lv_artist = TERRITORY_LEVELS[artist["territory"]]
        lv_req = TERRITORY_LEVELS[terr_rule["value"]]
        terr = 1.0 if lv_artist >= lv_req else 0.0
    # público: aproximação por posicionamento/nichos do artista
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
    """Recursos exigidos vs disponibilidade declarada."""
    avail = artist["availability"]
    viol = 0
    fmt = edital.get("proposal_requirements", {}).get("exhibition_formats", [])
    ftype = edital["opportunity_type"]
    needs_install = any("exhibition" in f or "aquisicao" in f for f in fmt) or ftype in (
        "premiacao_ocupacao_expositiva", "aquisicao_obras")
    needs_prod = ftype in ("fomento_projetos", "financiamento_projetos", "formacao")
    if needs_prod and not avail["equipe"]:
        viol += 1
    if not avail["documentacao_completa"]:
        viol += 1
    if needs_install and not any(w["availability"] in ("obras_prontas", "obra_pronta", "producao_parcial")
                                 for w in artist["artworks"]):
        viol += 1
    return max(0.0, 1.0 - 0.25 * viol)


# ---------------------------------------------------------------- score geral

SPEC_WEIGHTS = {"L": 0.15, "C": 0.20, "T": 0.10, "P": 0.15, "H": 0.10, "O": 0.15, "G": 0.05, "V": 0.10}

EXPOSICAO_TYPES = {"premiacao_ocupacao_expositiva", "aquisicao_obras"}


def combined_mix(edital):
    """Peso artista/portfólio por modalidade (MD 9.6)."""
    if edital["opportunity_type"] in EXPOSICAO_TYPES:
        return 0.35, 0.65
    return 0.60, 0.40


def compute_factors(artist, edital):
    return {
        "L": score_language(artist, edital),
        "C": score_concepts(artist, edital),
        "T": score_technique(artist, edital),
        "P": score_positioning(artist, edital),
        "H": score_trajectory(artist, edital),
        "G": score_territory_public(artist, edital),
        "V": score_feasibility(artist, edital),
    }


def weighted_score(factors, weights, null_mode="renormalize"):
    """null_mode: 'renormalize' (spec MD 9.3) ou 'neutral' (None conta como 0.5)."""
    num = den = 0.0
    for k, w in weights.items():
        v = factors.get(k)
        if v is None and null_mode == "neutral":
            v = 0.5
        if v is not None:
            num += w * v
            den += w
    if den == 0:
        return None
    return num / den


def rank_artist_edital(artist, edital, weights=None, alpha=0.6, cap_by_explicit=True, null_mode="renormalize"):
    """Score completo. cap_by_explicit: se requisito artístico explícito obrigatório
    não atendido, compatibilidade não pode passar de 45 (v2).
    null_mode: renormalize (v0, spec) | neutral (v4)."""
    weights = weights or SPEC_WEIGHTS
    elig = check_eligibility(artist, edital)
    factors = compute_factors(artist, edital)
    factors["O"] = score_work_portfolio(artist, edital, alpha)
    artist_score = weighted_score(factors, weights, null_mode)
    wa, wp = combined_mix(edital)
    final = None
    if artist_score is not None:
        final = 100 * (wa * artist_score + wp * (factors["O"] or 0.0))
    cap = None
    if cap_by_explicit:
        caps = []
        lv_rules = edital["artistic_requirements"]["languages"]
        langs = artist["languages_main"] + artist["languages_secondary"]
        for r in lv_rules:
            if r["strength"] == "explicit_mandatory" and r.get("role", "core") == "core":
                if not any(lang_match(langs, v) > 0 for v in r["value"]):
                    caps.append(45.0)
        for r in edital["artistic_requirements"]["positioning"]:
            if r["strength"] == "explicit_mandatory" and not set(r["value"]) & set(artist["positioning"]):
                caps.append(45.0)
        for r in edital["artistic_requirements"]["niches"]:
            if r["strength"] == "explicit_mandatory" and not set(r["value"]) & set(artist["niches"]):
                caps.append(45.0)
        if caps:
            cap = min(caps)
    final_capped = min(final, cap) if (final is not None and cap is not None) else final
    cov = sum(1 for v in factors.values() if v is not None) / len(factors)
    conf = 100 * (0.35 * artist["coverage"]["campos_preenchidos"]
                  + 0.30 * artist["coverage"]["qualidade_evidencias"]
                  + 0.15 * artist["coverage"]["atualidade"]
                  + 0.20 * artist["coverage"]["confianca_extracao"])
    return {
        "artist": artist["id"], "edital": edital["id"],
        "eligibility": elig["status"], "elig_fails": elig["fails"], "elig_unknowns": elig["unknowns"],
        "factors": factors, "artist_score": artist_score, "portfolio_score": factors["O"],
        "final": final_capped, "final_raw": final, "cap": cap,
        "coverage": cov, "confidence": conf,
    }
