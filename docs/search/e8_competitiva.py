# -*- coding: utf-8 -*-
"""E8 — Projeção competitiva nos critérios oficiais do edital Malakoff (26 pontos).

Mapeamento ilustrativo fator -> critério oficial (documentado no edital):
trajetória<-H; qualidade conceitual<-0.5*(C|0.5)+0.5*P; viabilidade<-V;
originalidade<-ineditismo das obras; clareza<-cobertura de dados;
diversidade/acesso<-G + posicionamento popular/comunitária; acessibilidade<-V.
É uma PROJEÇÃO para exibição ao artista, não a nota da banca.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dataset_editais import EDITAIS
from dataset_artistas import ARTISTAS
from engine import rank_artist_edital

malakoff = next(e for e in EDITAIS if e["id"] == "malakoff_observa4")


def project_malakoff(artist):
    r = rank_artist_edital(artist, malakoff, cap_by_explicit=True, null_mode="neutral")
    f = r["factors"]
    c_val = f["C"] if f["C"] is not None else 0.5
    inedit = 0.4
    for w in artist["artworks"]:
        if w["availability"] == "obra_inedita":
            inedit = max(inedit, 1.0)
        elif w["availability"] in ("obras_prontas", "obra_pronta"):
            inedit = max(inedit, 0.6)
        elif w["availability"] == "producao_parcial":
            inedit = max(inedit, 0.7)
    div_pos = 1.0 if any(p in ("comunitaria", "popular", "periferica") for p in artist["positioning"]) else 0.35
    return {
        "trajetoria": round(4 * (f["H"] or 0), 1),
        "qualidade_conceitual": round(4 * 0.5 * (c_val + (f["P"] or 0.5)), 1),
        "viabilidade": round(4 * (f["V"] or 0.5), 1),
        "originalidade_ineditismo": round(4 * inedit, 1),
        "clareza_apresentacao": round(4 * r["coverage"], 1),
        "diversidade_acesso": round(4 * (0.6 * (f["G"] or 0.5) + 0.4 * div_pos), 1),
        "acessibilidade": round(2 * (f["V"] or 0.5), 1),
        "total": 0,
        "compatibilidade_v4": round(r["final"], 1),
    }


out = {}
for aid in ("ana_foto_memoria", "marina_multimidia", "beto_iniciante", "mestre_bituca"):
    artist = next(a for a in ARTISTAS if a["id"] == aid)
    p = project_malakoff(artist)
    p["total"] = round(sum(v for k, v in p.items() if k not in ("total", "compatibilidade_v4")), 1)
    out[aid] = p
    print(f"{aid:<20} " + "  ".join(f"{k}={v}" for k, v in p.items()))

res = "/home/z/my-project/download/artistrank/results"
with open(os.path.join(res, "projecao_competitiva_malakoff.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("salvo projecao_competitiva_malakoff.json")
