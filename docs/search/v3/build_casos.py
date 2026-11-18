# -*- coding: utf-8 -*-
"""Casos de elegibilidade e teto (4.4) sobre editais reais + fixtures de artista.
Regras marcadas como regra_teste=true existem só para testar a mecânica do motor e
NÃO são requisitos publicados do edital real."""
import copy
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
EDS = json.load(open(os.path.join(HERE, "data_v3/editais_v3.json"), encoding="utf-8"))
ED = {e["id"]: e for e in EDS}


def fixture_artist(**kw):
    base = {"id": "case_x", "nome": "Fixtures de teste", "languages_main": [], "languages_secondary": [],
            "positioning": [], "niches": [], "concepts": {"central": [], "secondary": []},
            "territory": "city_recife", "years_active": 5, "trajectory": [],
            "artworks": [{"title": "obra teste", "language": "danca", "techniques": [], "supports": [],
                          "concepts": [], "scale": "medio", "availability": "obras_prontas",
                          "descricao": "obra de fixture", "fonte": "fixture"}],
            "availability": {"equipe": False, "documentacao_completa": True},
            "coverage": {"campos_preenchidos": 0.5, "qualidade_evidencias": 0.9,
                         "atualidade": 1.0, "confianca_extracao": 1.0}}
    base.update(kw)
    return base


def fixture_edital(eid, extra_rules=None):
    e = copy.deepcopy(ED[eid])
    for r in extra_rules or []:
        r["regra_teste"] = True
        e["eligibility"].append(r)
    return e


CASES = [
    {"id": "C1_territorio_fail", "edital": "sic2024_fic_musica", "tipo": "FAIL_bloqueia",
     "artista": fixture_artist(id="case_metro", territory="metro_recife", languages_main=["musica"]),
     "esperado": {"eligibility": "INELIGIBLE", "fails": ["territory"], "final": None},
     "nota": "Residência municipal é requisito real do SIC; artista de região metropolitana não elegível."},
    {"id": "C2_territorio_unknown", "edital": "sic2024_fic_musica", "tipo": "UNKNOWN_pendente",
     "artista": fixture_artist(id="case_sem_terr", territory=None, languages_main=["musica"]),
     "esperado": {"eligibility": "PENDING", "unknowns": ["territory"], "final": ">=0"},
     "nota": "Campo vazio mostra 'pendente'; não bloqueia e não ativa teto."},
    {"id": "C3_linguagem_unknown_sem_teto", "edital": "sic2024_fic_artes_visuais", "tipo": "UNKNOWN_sem_teto",
     "artista": fixture_artist(id="case_sem_lang", languages_main=[], languages_secondary=[]),
     "esperado": {"eligibility": "ELIGIBLE", "cap": None, "language_factor": None},
     "nota": "Linguagem não declarada = UNKNOWN; NÃO ativa teto de 45 (regra 5 da v3)."},
    {"id": "C4_core_fail_cap45", "edital": "fidr_2026", "tipo": "FAIL_teto45",
     "artista": fixture_artist(id="case_foto", languages_main=["fotografia"]),
     "esperado": {"eligibility": "ELIGIBLE", "cap": 45.0},
     "nota": "Campo preenchido (fotografia) sem correspondência com core dança -> teto 45."},
    {"id": "C5_suporte_nao_casa_core", "edital": "fidr_2026", "tipo": "FAIL_teto45_suporte",
     "artista": fixture_artist(id="case_teatro_sec", languages_main=["teatro"], languages_secondary=["danca"]),
     "esperado": {"eligibility": "ELIGIBLE", "cap": 45.0},
     "nota": "dança só no suporte: core obrigatório casa apenas com núcleo -> FAIL -> teto 45."},
    {"id": "C6_preference_nunca_teto", "edital": "observa3_malakoff_2025", "tipo": "preference_sem_teto",
     "artista": fixture_artist(id="case_visuais_sem_conceito", languages_main=["artes_visuais"], concepts={"central": [], "secondary": []}),
     "esperado": {"eligibility": "ELIGIBLE", "cap": None},
     "nota": "Conceitos do OBSERVA são preference; nunca ativam teto, mesmo sem correspondência."},
    {"id": "C7_person_type_fail_bloqueia", "edital": "sic2024_fic_musica", "tipo": "FAIL_bloqueia_regra_teste",
     "edital_modificado": {"person_type": ["pf", "mei"]},
     "artista": fixture_artist(id="case_cnpj", languages_main=["musica"], person_type="cnpj"),
     "esperado": {"eligibility": "INELIGIBLE", "fails": ["person_type"], "final": None},
     "nota": "Regra de teste (não publicada no edital capturado): prova que FAIL em eliminatório bloqueia mesmo com score alto."},
    {"id": "C8_formacao_unknown", "edital": "bolsa_escola_frevo_2026", "tipo": "UNKNOWN_pendente_regra_teste",
     "edital_modificado": {"formacao": ["ensino_medio_completo", "fundamental_completo"]},
     "artista": fixture_artist(id="case_sem_formacao", languages_main=["danca"], formacao=None),
     "esperado": {"eligibility": "PENDING", "unknowns": ["formacao"], "final": ">=0"},
     "nota": "Regra de teste: formação ausente = UNKNOWN pendente, não bloqueia."},
    {"id": "C9_min_years_fail", "edital": "fidr_2026", "tipo": "FAIL_bloqueia_regra_teste",
     "edital_modificado": {"min_activity_years": 10},
     "artista": fixture_artist(id="case_iniciante", languages_main=["danca"], years_active=2),
     "esperado": {"eligibility": "INELIGIBLE", "fails": ["min_activity_years"], "final": None},
     "nota": "Regra de teste: tempo mínimo de atuação; FAIL bloqueia antes da nota."},
]

out = []
for c in CASES:
    e = ED[c["edital"]]
    mod = c.get("edital_modificado", {})
    if "person_type" in mod:
        e = fixture_edital(c["edital"], [{"type": "person_type", "value": mod["person_type"], "strength": "explicit_mandatory"}])
    if "formacao" in mod:
        e = fixture_edital(c["edital"], [{"type": "formacao", "value": mod["formacao"], "strength": "explicit_mandatory"}])
    if "min_activity_years" in mod:
        e = fixture_edital(c["edital"], [{"type": "min_activity_years", "value": mod["min_activity_years"], "strength": "explicit_mandatory"}])
    out.append({"id": c["id"], "edital": c["edital"], "tipo": c["tipo"], "nota": c["nota"],
                "esperado": c["esperado"], "artista": c["artista"],
                "edital_fixture": e if (c.get("edital_modificado")) else None})
json.dump(out, open(os.path.join(HERE, "data_v3/casos_elegibilidade_teto.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("casos gravados:", len(out))
