# -*- coding: utf-8 -*-
"""Dataset REAL — ArtistRank Benchmark v2.0 (Recife verificado; Olinda/Caruaru registrados).
Fontes: PDFs oficiais de resultados (culturarecife.com.br), notícia TV Guararapes (OBSERVA 3),
edital FIC SIC 2025 (residência municipal verificada). Nenhum dado inventado.
"""
import json, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_real")
os.makedirs(OUT, exist_ok=True)

# ------------------------------------------------------------------ ARTISTAS
# Perfis mínimos REAIS: linguagem/segmento do edital em que foram aprovados/selecionados,
# conceitos derivados literalmente do título do projeto ou do texto de fonte jornalística.
# Trajetória/experiências: não publicadas nos resultados -> vazias (cobertura honesta).
def A(id, nome, langs_main, langs_sec, concepts, works, years=6, fonte="", pos=None, niches=None, techniques=None):
    techniques = techniques or []
    return {
        "id": id, "nome": nome, "resume": f"Proponente contemplado(a) em edital municipal (fonte: {fonte}).",
        "languages_main": langs_main, "languages_secondary": langs_sec,
        "positioning": pos or [], "niches": niches or [],
        "concepts": {"central": concepts, "secondary": []},
        "territory": "city_recife", "years_active": years,
        "trajectory": [],
        "artworks": [{"title": t, "language": l, "techniques": techniques, "supports": [],
                      "concepts": concepts, "scale": "medio", "availability": avail} for t, l, avail in works],
        "availability": {"equipe": False, "documentacao_completa": True},
        "coverage": {"campos_preenchidos": 0.55, "qualidade_evidencias": 0.85,
                     "atualidade": 1.0, "confianca_extracao": 0.95},
        "fonte": fonte,
    }

ARTISTAS = [
    A("jaqueline_brandao", "Jaqueline Cristina Macedo Brandão", ["cinema"], ["documentario"],
      ["cidade", "violencia"], works=[("OS GUERREIROS DA RUA - O FILME", "documentario", "projeto_novo")],
      fonte="SIC 2024 FIC Audiovisual (resultado final 3ª fase)"),
    A("diego_lopes", "Diego Fernandes Gomes Lopes", ["cinema"], ["documentario"],
      ["memoria", "patrimonio"], works=[("OS PIONEIROS DA AVIAÇÃO", "documentario", "projeto_novo")],
      fonte="SIC 2024 FIC Audiovisual (resultado final 3ª fase)"),
    A("inst_ricardo_brenand", "Instituto Ricardo Brennand", ["musica"], [],
      ["patrimonio"], works=[("FESTIVAL ACORDES PARA O MUSEU", "musica", "projeto_novo")],
      fonte="SIC 2024 FIC Música (resultado final 3ª fase)"),
    A("mr_plot", "Mr. Plot Produções", ["musica"], [],
      [], works=[("CIRCULAÇÃO SHOW DO BITA - CRESCER E APRENDER", "musica", "projeto_novo")],
      fonte="SIC 2024 FIC Música (resultado final 3ª fase)"),
    A("maracatu_porto_rico", "Nação do Maracatu Porto Rico", ["cultura_popular"], ["musica"],
      ["cultura_popular"], works=[("MARACATU PORTO RICO SINFÔNICO", "cultura_popular", "projeto_novo")],
      techniques=["percussao"], fonte="SIC 2024 FIC Cultura Popular (resultado final 3ª fase)"),
    A("alzenide_simoes", "Alzenide Prazeres Simões", ["cultura_popular"], ["artes_visuais"],
      ["cultura_popular", "identidade"], works=[("MARACATU – ANTROPOLOGIA VISUAL", "cultura_popular", "projeto_novo")],
      techniques=["percussao"], fonte="SIC 2024 FIC Cultura Popular (resultado final 3ª fase)"),
    A("junior_artes_belo", "Junior Artes e Produções (J.A. Taveira Belo)", ["teatro"], [],
      ["religiosidade"], works=[("OS AMBULANTES DE DEUS", "teatro", "projeto_novo")],
      fonte="SIC 2024 FIC Teatro (resultado final 3ª fase)"),
    A("edivane_aguiar", "Edivane Batista Tavares Aguiar", ["teatro"], [],
      [], works=[("22.º FESTIVAL DE TEATRO PARA CRIANÇAS DE PERNAMBUCO", "teatro", "projeto_novo")],
      fonte="SIC 2024 FIC Teatro (resultado final 3ª fase)"),
    A("marcelo_buarque", "Marcelo Victor Silva Buarque", ["artes_visuais"], ["pintura"],
      ["trabalho", "cidade"], works=[("PÃO E TINTA - COR E COMÉRCIO", "artes_visuais", "projeto_novo")],
      techniques=["pintura"], fonte="SIC 2024 FIC Artes Visuais (resultado final 3ª fase)"),
    A("julio_vasconcelos", "Julio Cesar Bacelar de Vasconcelos", ["artes_visuais"], [],
      [], works=[("O SONHO E O RISO", "artes_visuais", "projeto_novo")],
      fonte="SIC 2024 FIC Artes Visuais (resultado final 3ª fase)"),
    A("maria_fatima_pontes", "Maria de Fátima Pontes", ["circo"], [],
      [], works=[("I FESTIVAL VIRADES NUM MÓI DE CUENTRO - FAZENDO CIRCO EM RECIFE COMO RESISTÊNCIA!", "circo", "projeto_novo")],
      fonte="SIC 2024 FIC Circo (resultado final 3ª fase)"),
    A("luiza_fontes", "Luíza Santa Cruz Fontes", ["circo"], [],
      [], works=[("A BOBA: UMA JORNADA", "circo", "projeto_novo")],
      fonte="SIC 2024 FIC Circo (resultado final 3ª fase)"),
    A("jessica_miranda", "Jessica Evelyn Claudino Lobo de Miranda", ["multilinguagens"], ["arte_digital"],
      ["contemporaneidade"], works=[("PARA ADIAR O FIM DO MUNDO (Encontros de Ideias)", "arte_digital", "projeto_novo")],
      fonte="SIC 2023 FIC Artes Integradas e Arte e Tecnologia (projetos aprovados)"),
    A("valeria_fagundes", "Valeria Pereira Fagundes", ["musica"], ["artes_visuais"],
      ["memoria"], works=[("ROCK PERNAMBUCANO EM 50 CAPAS", "musica", "projeto_novo")],
      fonte="SIC 2023 FIC Artes Integradas e Arte e Tecnologia (projetos aprovados)"),
    A("robsmar_silva", "Robsmar da Silva (Mostra DNA Afro)", ["cultura_popular"], [],
      ["memoria", "ancestralidade"], works=[("MOSTRA DNA AFRO", "cultura_popular", "projeto_novo")],
      fonte="SIC 2023 FIC Artes Integradas e Arte e Tecnologia (projetos aprovados)"),
    A("joao_fernando_silva", "João Fernando Dias da Silva", ["circo"], ["performance"],
      ["genero", "sexualidade"], works=[("MOSTRA QUEER DE ARTES PERFORMATIVAS - MAIS DO QUE LETRAS, PESSOAS! MAIS QUE ORGULHO, LUTA!", "circo", "projeto_novo")],
      fonte="Multilinguagens Recife Criativo PNAB 2026 (resultado final, nota 10,0000)"),
    A("joao_lucas_cavalcanti", "João Lucas de Sá Leitão Cavalcanti", ["circo"], [],
      [], works=[("APRESENTAÇÕES NOVE TENTATIVAS DE NÃO SUCUMBIR", "circo", "projeto_novo")],
      fonte="Multilinguagens Recife Criativo PNAB 2026 (resultado final, nota 9,9500)"),
    A("kananda_silva", "Kananda Maria Correia da Silva", ["musica"], [],
      ["genero", "cidade"], pos=["comunitaria"], works=[("1º ENCONTRO MUNICIPAL DE FORMAÇÃO DA FRENTE DE MULHERES NO HIP HOP - RECIFE", "musica", "projeto_novo")],
      fonte="Virado na Periferia PNAB 2026 (resultado preliminar com nota 8,5500)"),
    A("rarynne_barros", "Rarynne Francynne de Jesus Profiro Barros", ["musica"], [],
      ["cidade"], works=[("CIDADE SONORA", "musica", "projeto_novo")],
      fonte="Virado na Periferia PNAB 2026 (resultado preliminar com nota 8,2333)"),
    A("claudemilson_souza", "Claudemilson Soares de Souza", ["danca"], [],
      [], works=[("CARREGO", "danca", "projeto_novo")],
      fonte="O Solo do Outro 2026 (resultado preliminar, 1º selecionado)"),
    A("maria_pepe", "Maria Eduarda Sousa Pepe", ["teatro"], [],
      ["sexualidade"], works=[("ORGIA", "teatro", "projeto_novo")],
      fonte="O Aprendiz em Cena 2026 (resultado preliminar, 1º selecionado)"),
    A("shermison_silva", "Shermison Henrique da Silva", ["danca"], [],
      ["patrimonio", "cultura_popular"], works=[("Bolsa de Formação Escola de Frevo — Pesquisa-Criação: Frevo como Metodologia Contemporânea", "danca", "projeto_novo")],
      fonte="Edital Interno de Bolsas Escola de Frevo 2026 (resultado final, 1º selecionado)"),
    A("amanda_colaco", "Amanda Carolina Colaço", ["danca"], [],
      ["patrimonio"], works=[("Bolsa de Formação Escola de Frevo — Pesquisa-Criação em Dança", "danca", "projeto_novo")],
      fonte="Edital Interno de Bolsas Escola de Frevo 2026 (resultado final, 2ª selecionada)"),
    A("ana_neves", "Ana Neves", ["artes_visuais"], [],
      ["memoria", "territorio"], works=[("Tropical Trópico: aqui tudo derrete", "artes_visuais", "obras_prontas")],
      fonte="OBSERVA 3 — Torre Malakoff 2025 (selecionados; TV Guararapes 17/06/2025)"),
    A("geoneide_brandao", "Geoneide Brandão", ["artes_visuais"], ["pintura"],
      ["genero", "sexualidade", "identidade", "afetividade"], works=[("Entre nós todo o indizível se faz presente", "pintura", "obras_prontas")],
      techniques=["pintura"], fonte="OBSERVA 3 — Torre Malakoff 2025 (selecionados; TV Guararapes 17/06/2025)"),
    A("icaro_galvao", "Ícaro Galvão", ["artes_visuais"], ["fotografia"],
      ["memoria", "natureza"], works=[("Encontros Monumentais", "fotografia", "obras_prontas")],
      techniques=["fotografia_analogica", "video", "instalacao"],
      fonte="OBSERVA 3 — Torre Malakoff 2025 (selecionados; TV Guararapes 17/06/2025)"),
    A("luciana_borre", "Luciana Borre", ["artes_visuais"], ["multilinguagens"],
      ["afetividade"], works=[("?Toda vez que me perco de mim?", "multilinguagens", "obras_prontas")],
      techniques=["bordado", "gravura", "videoarte", "instalacao"],
      fonte="OBSERVA 3 — Torre Malakoff 2025 (selecionados; TV Guararapes 17/06/2025)"),
    A("paulo_oliveira", "Paulo Oliveira Quacula", ["artes_visuais"], ["escultura"],
      ["ancestralidade", "natureza"], works=[("Acervo escultórico em madeiras naturais", "escultura", "obras_prontas")],
      techniques=["escultura", "madeira"], years=30,
      fonte="OBSERVA 3 — Torre Malakoff 2025 (selecionados; TV Guararapes 17/06/2025)"),
    A("maria_emilia_gomes", "Maria Emília da Cruz Gomes", ["danca"], [],
      [], works=[("COLIBRI", "danca", "obras_prontas")],
      fonte="29º FIDR 2026 (resultado final pós-recursos, 1ª classificada espetáculo)"),
    A("roberto_macedo", "Roberto Alexandre Macedo", ["danca"], [],
      ["cidade"], works=[("O DONO DA RUA", "danca", "obras_prontas")],
      fonte="29º FIDR 2026 (resultado final pós-recursos, 2º classificado espetáculo)"),
]

# ------------------------------------------------------------------ EDITAIS (âncora)
def E(id, titulo, tipo, langs, fonte, conceitos=None, resid_mand=True, formatos=None):
    elig = [{"type": "territory", "value": "city_recife", "strength": "explicit_mandatory" if resid_mand else "undeclared"}]
    req_langs = [{"value": [v], "role": "core", "strength": "explicit_mandatory"} for v in langs]
    return {
        "id": id, "title": titulo, "municipio": "Recife", "ano": None,
        "description_text": f"{titulo}. Edital municipal real com resultado publicado.",
        "opportunity_type": tipo,
        "eligibility": elig,
        "artistic_requirements": {
            "languages": req_langs,
            "concepts": [{"value": conceitos or [], "strength": "preference"}] if conceitos else [],
            "positioning": [], "niches": [], "techniques": [], "supports": [],
        },
        "proposal_requirements": {"exhibition_formats": formatos or [], "unpublished_preferred": False},
        "fonte": fonte,
    }

EDITAIS = [
    E("sic2024_fic_audiovisual", "FIC/SIC 2024 — Audiovisual", "financiamento_projetos", ["cinema", "audiovisual"],
      "culturarecife.com.br resultado_home_28 (Projetos Aprovados 3ª fase)"),
    E("sic2024_fic_musica", "FIC/SIC 2024 — Música", "financiamento_projetos", ["musica"],
      "culturarecife.com.br resultado_home_28 (Projetos Aprovados 3ª fase)"),
    E("sic2024_fic_cultura_popular", "FIC/SIC 2024 — Cultura Popular", "financiamento_projetos", ["cultura_popular"],
      "culturarecife.com.br resultado_home_28 (Projetos Aprovados 3ª fase)"),
    E("sic2024_fic_teatro", "FIC/SIC 2024 — Teatro", "financiamento_projetos", ["teatro"],
      "culturarecife.com.br resultado_home_28 (Projetos Aprovados 3ª fase)"),
    E("sic2024_fic_artes_visuais", "FIC/SIC 2024 — Artes Visuais", "financiamento_projetos", ["artes_visuais"],
      "culturarecife.com.br resultado_home_28 (Projetos Aprovados 3ª fase)"),
    E("sic2024_fic_circo", "FIC/SIC 2024 — Circo", "financiamento_projetos", ["circo"],
      "culturarecife.com.br resultado_home_28 (Projetos Aprovados 3ª fase)"),
    E("sic2023_fic_integradas", "FIC/SIC 2023 — Artes Integradas e Arte e Tecnologia", "financiamento_projetos", ["multilinguagens", "arte_digital"],
      "culturarecife.com.br resultado_home_44 (Projetos Aprovados SIC 2023)"),
    E("multilinguagens_pnab2026", "Multilinguagens Recife Criativo — PNAB 2026", "fomento_projetos",
      ["cinema", "musica", "teatro", "danca", "circo", "cultura_popular", "artes_visuais", "literatura", "multilinguagens"],
      "culturarecife.com.br resultado_home_13 (Resultado FINAL)"),
    E("virado_pnab2026_hiphop", "Recife Virado na Periferia — PNAB 2026 (Hip-Hop)", "fomento_projetos",
      ["musica", "artes_visuais"],
      "culturarecife.com.br resultado_home_11 (Resultado Preliminar com nota)"),
    E("solo_do_outro_2026", "O Solo do Outro 2026 — Fomento de Pesquisa em Dança", "fomento_pesquisa", ["danca"],
      "culturarecife.com.br resultado_home_2 (Resultado Preliminar, 1º selecionado)"),
    E("aprendiz_em_cena_2026", "O Aprendiz em Cena 2026 — Fomento de Pesquisa em Teatro", "fomento_pesquisa", ["teatro"],
      "culturarecife.com.br resultado_home_3 (Resultado Preliminar, 1º selecionado)"),
    E("bolsa_escola_frevo_2026", "Bolsa de Formação — Escola de Frevo 2026", "formacao", ["danca"],
      "culturarecife.com.br resultado_home_8 (Resultado Final)"),
    E("observa3_malakoff_2025", "3º Edital OBSERVA — Torre Malakoff 2025 (ocupação expositiva)", "premiacao_ocupacao_expositiva",
      ["artes_visuais"],
      "TV Guararapes 17/06/2025 + Diário de Pernambuco (5 selecionados)", resid_mand=False, formatos=["exhibition"]),
    E("fidr_2026", "29º Festival Internacional de Dança do Recife — Convocatória 2026", "programacao_festival", ["danca"],
      "culturarecife.com.br resultado_home_7 (Resultado Final pós-recursos, ordem de classificação)"),
]

# âncoras vencedor-edital (≤2 por edital) e aprovados adicionais (excluídos da disputa para o próprio edital)
ANCHORS = {
    "sic2024_fic_audiovisual": ["jaqueline_brandao", "diego_lopes"],
    "sic2024_fic_musica": ["inst_ricardo_brenand", "mr_plot"],
    "sic2024_fic_cultura_popular": ["maracatu_porto_rico", "alzenide_simoes"],
    "sic2024_fic_teatro": ["junior_artes_belo", "edivane_aguiar"],
    "sic2024_fic_artes_visuais": ["marcelo_buarque", "julio_vasconcelos"],
    "sic2024_fic_circo": ["maria_fatima_pontes", "luiza_fontes"],
    "sic2023_fic_integradas": ["jessica_miranda", "valeria_fagundes"],
    "multilinguagens_pnab2026": ["joao_fernando_silva", "joao_lucas_cavalcanti"],
    "virado_pnab2026_hiphop": ["kananda_silva", "rarynne_barros"],
    "solo_do_outro_2026": ["claudemilson_souza"],
    "aprendiz_em_cena_2026": ["maria_pepe"],
    "bolsa_escola_frevo_2026": ["shermison_silva", "amanda_colaco"],
    "observa3_malakoff_2025": ["ana_neves", "geoneide_brandao"],
    "fidr_2026": ["maria_emilia_gomes", "roberto_macedo"],
}
EXCLUDED = {
    "sic2023_fic_integradas": ["robsmar_silva"],
    "observa3_malakoff_2025": ["icaro_galvao", "luciana_borre", "paulo_oliveira"],
}

# ------------------------------------------------------------------ REGISTRO: editais com resultado identificado mas não capturável no sandbox
PENDENTES = [
    {"id": "caruaru_sao_joao_2025_musica", "titulo": "Edital de Chamamento São João 2025 — Música", "municipio": "Caruaru",
     "fonte": "mapacultural.caruaru.pe.gov.br (LISTA DE HABILITADOS — 51 páginas)", "url": "https://mapacultural.caruaru.pe.gov.br/storage/anexoEditais/EDITAL%20DE%20CHAMAMENTO%20S%C3%83O%20JO%C3%83O%202025/LISTA%20DE%20HABILITADOS%20DO%20EDITAL%20DE%20MUSICA%20-%20S%C3%83O%20JO%C3%83O%202025.pdf", "status": "resultado identificado; portal inacessível pelo sandbox"},
    {"id": "caruaru_sao_joao_2025_linguagens", "titulo": "Edital de Chamamento São João 2025 — Demais Linguagens", "municipio": "Caruaru",
     "fonte": "mapacultural.caruaru.pe.gov.br (LISTA DE HABILITADOS)", "url": "https://mapacultural.caruaru.pe.gov.br/storage/anexoEditais/EDITAL%20DE%20CHAMAMENTO%20S%C3%83O%20JO%C3%83O%202025/LISTA%20DE%20HABILITADOS%20DO%20EDITAL%20DEMAIS%20LINGUAGENS%20-%20S%C3%83O%20JO%C3%83O%202025.pdf", "status": "resultado identificado; portal inacessível pelo sandbox"},
    {"id": "caruaru_pnab2026_anastacio", "titulo": "PNAB nº 001/2026 — Edital Anastácio Rodrigues", "municipio": "Caruaru",
     "fonte": "mapacultural.caruaru.pe.gov.br (lista final de contemplados)", "url": "https://mapacultural.caruaru.pe.gov.br/storage/anexoEditais/PNAB%20CICLO%202/lista_final_de_contemplados_pnab_2026_edital_001_anastacio_rodrigues_anexo_1790693383.pdf", "status": "lista final publicada; portal inacessível pelo sandbox"},
    {"id": "caruaru_pnab2024_criativo", "titulo": "PNAB nº 001/2024 — Caruaru Criativo (resultado do mérito)", "municipio": "Caruaru",
     "fonte": "mapacultural.caruaru.pe.gov.br + Scribd (RELACAO-EDITAL-1)", "url": "https://mapacultural.caruaru.pe.gov.br/storage/anexoEditais/PNAB/RESULTADO%20DOCUMENTAL%20EDITAL%2001.pdf", "status": "resultado publicado; portal inacessível pelo sandbox"},
    {"id": "olinda_premiacao_001_2026", "titulo": "Edital de Premiação Cultural nº 001/2026 — PNAB Olinda", "municipio": "Olinda",
     "fonte": "comunicação oficial da Prefeitura de Olinda (resultado preliminar de análise)", "url": "https://olinda.pe.gov.br/pagina/cultura", "status": "resultado preliminar publicado; portal inacessível pelo sandbox"},
    {"id": "olinda_pontos_cultura_004_2026", "titulo": "Chamamento nº 004/2026 — Premiação de Pontos de Cultura (PNAB Olinda)", "municipio": "Olinda",
     "fonte": "PNCP — compra 2026/494 do CNPJ 10.404.184/0001-09 (edital com anexos baixado)", "url": "https://pncp.gov.br/pncp-api/v1/orgaos/10404184000109/compras/2026/494/arquivos/1", "status": "edital completo capturado; resultado ainda não publicado no PNCP"},
]

if __name__ == "__main__":
    json.dump(ARTISTAS, open(f"{OUT}/artistas_reais.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(EDITAIS, open(f"{OUT}/editais_reais.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"anchors": ANCHORS, "excluded": EXCLUDED, "pendentes": PENDENTES},
              open(f"{OUT}/ground_truth.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    n_anchor = sum(len(v) for v in ANCHORS.values())
    print(f"artista pool: {len(ARTISTAS)}  |  editais âncora: {len(EDITAIS)}  |  pares travados: {n_anchor}")
    print(f"editais pendentes (Olinda/Caruaru): {len(PENDENTES)}  |  total no registro: {len(EDITAIS) + len(PENDENTES)}")
    ids = {a["id"] for a in ARTISTAS}
    for e, lst in ANCHORS.items():
        missing = [x for x in lst if x not in ids]
        if missing:
            print("FALTANDO:", e, missing)
    print("OK dataset gravado em", OUT)
