# -*- coding: utf-8 -*-
"""Dataset v3 — ArtistRank Benchmark com ganhadores travados + candidatos não ganhadores.
Fontes: PDFs oficiais (culturarecife.com.br) em scripts/artistrank_v3/pdf/, imprensa (TV Guararapes).
Idiomas por evidência própria/resultado; nada herdado por omissão. Nenhum dado inventado.
"""
import json
import os
import re
import unicodedata
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "data_v3")
os.makedirs(OUT, exist_ok=True)
P = json.load(open(os.path.join(HERE, "parse_out_v3.json"), encoding="utf-8"))

BASE_URL = "https://www.culturarecife.com.br/public/documentos/"
SRC = {
    "sic2024_audio": BASE_URL + "resultado_home_28_editais_do_sic_2024_fic_e_mic/Aprovados%20na%203a%20fase%20-%20AUDIOVISUAL.pdf",
    "sic2024_exceto": BASE_URL + "resultado_home_28_editais_do_sic_2024_fic_e_mic/PROJETOS-APROVADOS-E-INABILITADOS-APOS-3-FASE-EXCETO-AUDIOVISUAL-RESULTADO-FINAL-SIC-2024-FIC-E-MIC.pdf",
    "sic2023": BASE_URL + "resultado_home_44_edital_sic_2023_fic_mic/PROJETOS%20APROVADOS%20%28APOS%203%C2%AAFASE%29%20-%20RESULTADO%20FINAL%20-%20SIC%202023%20%28FIC%20E%20MIC%29.pdf",
    "multilinguagens": BASE_URL + "resultado_home_13_multilinguagem_recife_criativo_pnab_2026/Multilinguagem_Recife_Criativo_PNAB_Resultado_FINAL.pdf",
    "virado": BASE_URL + "resultado_home_11_recife_virado_na_periferia_pnab_2026/Virado_Periferia_HipHop_PNAB_Resultado_Preliminar.pdf",
    "danca": BASE_URL + "resultado_home_7_resultados_da_29a_festival_internacional_de_danca_do_recife_2026/Resultado%20Final%20da%20Convocat%C3%B3ria%20do%2029o%20Festival%20Internacional%20de%20Dan%C3%A7a%20do%20Recife%20-2026.pdf",
    "frevo": BASE_URL + "resultado_home_8_resultados_edital_interno_bolsas_escola_de_frevo/Resultado%20Final%20dos%20Habilitados%20e%20Selecionados%20do%20Edital%20Interno%20de%20Bolsas%20-%20Escola%20de%20Frevo.pdf",
    "solo": BASE_URL + "resultado_home_2_resultado_edital_de_fomento_o_solo_do_outro_2026/Resultado%20Preliminar%20dos%20Projetos%20Habilitados%20do%20Edital%20O%20Solo%20do%20Outro%202026.pdf",
    "aprendiz": BASE_URL + "resultado_home_3_resultados_edital_de_fomento_o_aprendiz_em_cena_2026/Resultado%20Preliminar%20dos%20Projetos%20Habilitados%20do%20Edital%20O%20Aprendiz%20em%20Cena%202026.pdf",
    "edital_fidr": BASE_URL + "edital_home_12_edital_festival_internacional_de_danca_do_recife_2026/Convocatoria%2029%20Festival%20Internacional%20de%20Danca%20do%20Recife-2026.pdf",
    "edital_frevo": BASE_URL + "edital_home_5_edital_interno_de_bolsas_escola_de_frevo/EDITAL%20INTERNO%20DE%20BOLSAS%20%E2%80%93%20ESCOLA%20DE%20FREVO.pdf",
    "edital_solo": BASE_URL + "edital_home_6_edital_de_fomento_de_pesquisa_em_danca_o_solo_do_outro_2026/Edital%20de%20Fomento%20de%20Pesquisa%20em%20Dan%C3%A7a%20O%20SOLO%20DO%20OUTRO%202026.pdf",
    "errata_pnab": BASE_URL + "edital_home_19_cultura_viva_pnab_2026/ERRATA%202%20-%20EDITAIS%20PNAB%202026.pdf",
    "observa3_imprensa": "https://www.tvguararapes.com.br/entretenimento/2025/06/17/exposicao-observa-3-ocupa-torre-malakoff-com-obras-de-cinco-artistas-visuais.html",
    "fic2025_edital": BASE_URL + "edital_fic_2025/EDITAL_FUNDO%20DE%20INCENTIVO%20-%20FIC_SIC%202025_retifica%C3%A7%C3%A3o%2028-04-26.pdf",
}
TVE = "TV Guararapes, 17/06/2025 (exposição Observa 3 — cinco artistas visuais selecionados por edital)"

SEG_TOKEN = {"Audiovisual": "cinema", "Música": "musica", "Musica": "musica", "Teatro": "teatro", "Dança": "danca",
             "Circo": "circo", "Cultura Popular": "cultura_popular", "Artes Visuais": "artes_visuais",
             "Artesanato": "artesanato", "Literatura": "literatura", "Fotografia": "fotografia", "Moda": "moda",
             "Gastronomia": "gastronomia", "Patrimônio Cultural E Museologia": "patrimonio_cultural",
             "Artes Culturais Integradas": "multilinguagens", "Artes Integradas": "multilinguagens",
             "Multilinguagens": "multilinguagens", "Rap": "musica", "Design E Moda": "moda", "Ópera": "musica"}


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


def norm_name(s):
    if not s:
        return ""
    s = re.sub(r"\d{5,}", "", s)
    return re.sub(r"\s+", " ", s).strip().lower()


# ---------------------------------------------------------------- ARTISTAS (perfis manuais, verificados)
# campos_preenchidos varia com a riqueza real da fonte (25%-90%).

def obra(titulo, lang, techniques=None, concepts=None, descr=None, availability="projeto_novo", fonte=None):
    return {"title": titulo, "language": lang, "techniques": techniques or [], "supports": [],
            "concepts": concepts or [], "scale": "medio", "availability": availability,
            "descricao": descr or titulo, "fonte": fonte}


def perfil(id, nome, langs_main, langs_sec, concepts, obras, cobertura, origem, pos=None, niches=None,
           years=None, trajetoria=None, contexto=None, fonte="", techniques=None):
    cov, evid = cobertura
    return {"id": id, "nome": nome, "resume": f"Proponente contemplado(a) em edital municipal. Fonte: {fonte}.",
            "languages_main": langs_main, "languages_secondary": langs_sec,
            "linguagem_origem": origem,
            "positioning": pos or [], "niches": niches or [],
            "concepts": {"central": concepts, "secondary": []},
            "territory": "city_recife", "years_active": years or 0,
            "trajectory": trajetoria or [],
            "artworks": obras,
            "availability": {"equipe": False, "documentacao_completa": True},
            "coverage": {"campos_preenchidos": cov, "qualidade_evidencias": evid,
                         "atualidade": 1.0, "confianca_extracao": 0.95},
            "contexto_trajetoria": contexto or {}, "fonte": fonte}


ARTISTAS = [
    # --- SIC 2024 FIC audiovisual (corrigido: âncoras de maior valor da seção FIC)
    perfil("leao_producoes", "Leão Produções Artísticas LTDA", ["cinema"], ["animacao"],
           [], [obra("ANIMAGE - 15º FESTIVAL INTERNACIONAL DE ANIMAÇÃO DE PERNAMBUCO", "cinema",
                     descr="Festival internacional de animação de Pernambuco (15ª edição).", fonte=SRC["sic2024_audio"])],
           (0.45, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Audiovisual, resultado final 3ª fase (maior valor FIC R$ 179.600)"),
    perfil("palas_alves", "Palas Camila Lustosa Cavalcanti Alves", ["cinema"], [],
           ["infancia"], [obra("MOSTRA CINE RUA INFANTIL: ANO 3", "cinema",
                               descr="Mostra de cinema de rua para infância, ano 3.", fonte=SRC["sic2024_audio"])],
           (0.45, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Audiovisual, resultado final 3ª fase (2º maior valor FIC R$ 105.100)"),
    # --- SIC 2024 MIC audiovisual (corrigido: os R$ 500 mil estão na seção MIC)
    perfil("jaqueline_brandao", "Jaqueline Cristina Macedo Brandão", ["cinema"], ["documentario"],
           ["cidade", "violencia"], [obra("OS GUERREIROS DA RUA - O FILME", "documentario",
                                          descr="Longa sobre os 'guerreiros da rua' — cinema e cidade.",
                                          fonte=SRC["sic2024_audio"])],
           (0.5, 0.9), "evidencia_propria", fonte="SIC 2024 MIC Audiovisual, resultado final 3ª fase (R$ 500.000,00)"),
    perfil("diego_lopes", "Diego Fernandes Gomes Lopes", ["cinema"], ["documentario"],
           ["memoria", "patrimonio"], [obra("OS PIONEIROS DA AVIAÇÃO", "documentario",
                                            descr="Documentário histórico sobre os pioneiros da aviação.",
                                            fonte=SRC["sic2024_audio"])],
           (0.5, 0.9), "evidencia_propria", fonte="SIC 2024 MIC Audiovisual, resultado final 3ª fase (R$ 500.000,00)"),
    # --- música
    perfil("inst_ricardo_brenand", "Instituto Ricardo Brennand", ["musica"], [],
           ["patrimonio"], [obra("FESTIVAL ACORDES PARA O MUSEU", "musica",
                                 descr="Festival de música no museu.", fonte=SRC["sic2024_exceto"])],
           (0.4, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Música (R$ 165.000,00)"),
    perfil("mr_plot", "Mr. Plot Produções", ["musica"], [],
           [], [obra("CIRCULAÇÃO SHOW DO BITA - CRESCER E APRENDER", "musica",
                     descr="Circulação de show infantil 'Show do Bita'.", fonte=SRC["sic2024_exceto"])],
           (0.4, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Música (R$ 165.000,00)"),
    # --- cultura popular
    perfil("maracatu_porto_rico", "Nação do Maracatu Porto Rico", ["cultura_popular"], ["musica"],
           ["cultura_popular", "ancestralidade"],
           [obra("MARACATU PORTO RICO SINFÔNICO", "cultura_popular", techniques=["percussao"],
                 descr="Encontro do maracatu com formação sinfônica.", fonte=SRC["sic2024_exceto"])],
           (0.55, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Cultura Popular (R$ 130.000,00)"),
    perfil("alzenide_simoes", "Alzenide Prazeres Simões", ["cultura_popular"], ["artes_visuais"],
           ["cultura_popular", "identidade"],
           [obra("MARACATU – ANTROPOLOGIA VISUAL", "cultura_popular", techniques=["percussao", "fotografia"],
                 descr="Pesquisa visual antropológica sobre o maracatu.", fonte=SRC["sic2024_exceto"])],
           (0.55, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Cultura Popular (R$ 110.000,00)"),
    # --- teatro (FIC) e MIC teatro
    perfil("edivane_aguiar", "Edivane Batista Tavares Aguiar", ["teatro"], [],
           [], [obra("22.º FESTIVAL DE TEATRO PARA CRIANÇAS DE PERNAMBUCO", "teatro",
                     descr="Festival de teatro para crianças.", fonte=SRC["sic2024_exceto"])],
           (0.4, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Teatro (R$ 100.000,00)"),
    perfil("o_poste_solucoes", "O Poste Soluções Luminosas LTDA - ME", ["teatro"], [],
           [], [obra("OCUPAÇÃO ESPAÇO O POSTE", "teatro",
                     descr="Ocupação do espaço cultural O Poste.", fonte=SRC["sic2024_exceto"])],
           (0.4, 0.9), "evidencia_resultado", fonte="SIC 2024 FIC Teatro (R$ 96.839,00)"),
    perfil("junior_artes_belo", "Junior Artes e Produções (J.A. Taveira Belo)", ["teatro"], [],
           ["religiosidade"], [obra("OS AMBULANTES DE DEUS", "teatro",
                                    descr="Espetáculo teatral 'Os Ambulantes de Deus'.", fonte=SRC["sic2024_exceto"])],
           (0.45, 0.9), "evidencia_propria", fonte="SIC 2024 MIC Teatro (R$ 150.000,00)"),
    perfil("ruy_machado", "Ruy Machado Aguiar Junior", ["teatro"], [],
           [], [obra("CLARICE LISPECTOR PARA CRIANÇAS", "teatro",
                     descr="Adaptação teatral de Clarice Lispector para crianças.", fonte=SRC["sic2024_exceto"])],
           (0.45, 0.9), "evidencia_propria", fonte="SIC 2024 MIC Teatro (R$ 79.990,00)"),
    # --- artes visuais
    perfil("marcelo_buarque", "Marcelo Victor Silva Buarque", ["artes_visuais"], ["pintura"],
           ["trabalho", "cidade"], [obra("PÃO E TINTA - COR E COMÉRCIO", "artes_visuais", techniques=["pintura"],
                                         descr="Série pictórica sobre cor e comércio.", fonte=SRC["sic2024_exceto"])],
           (0.5, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Artes Visuais (R$ 63.000,00)"),
    perfil("julio_vasconcelos", "Julio Cesar Bacelar de Vasconcelos", ["artes_visuais"], [],
           [], [obra("O SONHO E O RISO", "artes_visuais", descr="Obra visual 'O sonho e o risco'.",
                     fonte=SRC["sic2024_exceto"])],
           (0.4, 0.9), "evidencia_resultado", fonte="SIC 2024 FIC Artes Visuais (R$ 62.998,00)"),
    # --- circo
    perfil("maria_fatima_pontes", "Maria de Fátima Pontes", ["circo"], [],
           [], [obra("I FESTIVAL VIRADES NUM MÓI DE CUENTRO - FAZENDO CIRCO EM RECIFE COMO RESISTÊNCIA!", "circo",
                     descr="Festival de circo como resistência.", fonte=SRC["sic2024_exceto"])],
           (0.4, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Circo (R$ 59.750,00)"),
    perfil("luiza_fontes", "Luíza Santa Cruz Fontes", ["circo"], [],
           [], [obra("A BOBA: UMA JORNADA", "circo", descr="Espetáculo de circo 'A boba: uma jornada'.",
                     fonte=SRC["sic2024_exceto"])],
           (0.4, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Circo (R$ 54.000,00)"),
    # --- dança (novo)
    perfil("walderlane_justino", "Walderlane Cardoso Justino", ["danca"], [],
           [], [obra("NOSSOS CORPOS, TERRITÓRIOS DOS NOSSOS ENTRES: FASE TERRA", "danca",
                     descr="Coreografia sobre corpos e territórios — fase terra.", fonte=SRC["sic2024_exceto"])],
           (0.45, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Dança (R$ 60.000,00)"),
    perfil("assoc_artistas_integrados", "Associação Cultural de Artistas Integrados", ["danca"], [],
           [], [obra("FESTIVAL CENA CUMPLICIDADES", "danca", descr="Festival de dança Cena Cumplicidades.",
                     fonte=SRC["sic2024_exceto"])],
           (0.4, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Dança (R$ 60.000,00)"),
    # --- artesanato (novo)
    perfil("cleonice_cardoso", "Cleonice Rodrigues Cardoso", ["artesanato"], [],
           [], [obra("REDE ASTRALIZE DE ARTESÃS - EXPANSÃO E CONSOLIDAÇÃO", "artesanato",
                     descr="Rede de artesãs Astralize: expansão e consolidação.", fonte=SRC["sic2024_exceto"])],
           (0.4, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Artesanato (R$ 60.000,00)"),
    perfil("rosecleia_salvador", "Rosecleia de Souza Salvador", ["artesanato"], [],
           ["ancestralidade"], [obra("1ª FEIRA MULTIÉTNICA DE ARTESANATO INDÍGENA DO RECIFE", "artesanato",
                                     descr="Feira multiétnica de artesanato indígena.", fonte=SRC["sic2024_exceto"])],
           (0.45, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Artesanato (R$ 48.000,00)"),
    # --- literatura (novo)
    perfil("raiza_milfont", "Raiza Hanna Saraiva Milfont", ["literatura"], [],
           ["genero"], [obra("PRÊMIO CLARICE LISPECTOR PARA AUTORAS PERNAMBUCANAS", "literatura",
                             descr="Prêmio literário para autoras pernambucanas.", fonte=SRC["sic2024_exceto"])],
           (0.45, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Literatura (R$ 48.000,00)"),
    perfil("gabriel_santana", "Gabriel Lopes de Santana", ["literatura"], [],
           [], [obra("NAS DOBRAS DO LIVRO", "literatura", descr="Projeto literário 'Nas dobras do livro'.",
                     fonte=SRC["sic2024_exceto"])],
           (0.4, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Literatura (R$ 48.000,00)"),
    # --- fotografia (novo)
    perfil("ventana_filmes", "Ventana Filmes LTDA ME", ["fotografia"], ["cinema"],
           ["genero"], [obra("PODE ME CHAMAR DE FEMINISTA - RECIFE", "fotografia",
                             descr="Projeto fotográfico/audiovisual 'Pode me chamar de feminista — Recife'.",
                             fonte=SRC["sic2024_exceto"])],
           (0.45, 0.9), "evidencia_resultado", fonte="SIC 2024 FIC Fotografia (R$ 49.000,00)"),
    perfil("vitor_lima", "Vitor Jose Pessoa de Lima", ["fotografia"], [],
           [], [obra("Z-1", "fotografia", descr="Projeto fotográfico 'Z-1'.", fonte=SRC["sic2024_exceto"])],
           (0.35, 0.9), "evidencia_resultado", fonte="SIC 2024 FIC Fotografia (R$ 48.000,00)"),
    # --- moda (novo)
    perfil("juliana_araujo_silva", "Juliana Araujo e Silva", ["moda"], ["artes_visuais"],
           ["cultura_popular"], [obra("TINGIDO A SETE ERVAS: MODA AUTORAL COM CORES DOS MERCADOS DO RECIFE", "moda",
                                      techniques=["tingimento"], descr="Moda autoral com tingimento natural e cores dos mercados do Recife.",
                                      fonte=SRC["sic2024_exceto"])],
           (0.5, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Design e Moda (R$ 48.000,00)"),
    perfil("natalia_borges", "Natalia Ester Prado Borges", ["moda"], [],
           [], [obra("COSTURANDO OS ODSS NO COMPAZ", "moda", techniques=["costura"],
                     descr="Costura e objetivos de desenvolvimento sustentável no Compaz.",
                     fonte=SRC["sic2024_exceto"])],
           (0.45, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Design e Moda (R$ 48.000,00)"),
    # --- patrimônio (novo)
    perfil("weldjane_araujo", "Weldjane Mary Régis de Araújo", ["patrimonio_cultural"], ["artes_visuais"],
           ["memoria"], [obra("RECIFE EM TRAMA (GNOMON CULTURAL)", "patrimonio_cultural", techniques=["textil"],
                              descr="Pesquisa do patrimônio têxtil do Recife.", fonte=SRC["sic2024_exceto"])],
           (0.5, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Patrimônio Cultural e Museologia (R$ 89.940,00)"),
    perfil("jose_rommel_silva", "José Rommel Bezerra da Silva", ["patrimonio_cultural"], [],
           [], [obra("RECONHECER PARA PRESERVAR - CICLO FORMATIVO EM EDUCAÇÃO PATRIMONIAL DO RECIFE", "patrimonio_cultural",
                     descr="Ciclo formativo em educação patrimonial.", fonte=SRC["sic2024_exceto"])],
           (0.5, 0.9), "evidencia_propria", fonte="SIC 2024 FIC Patrimônio Cultural e Museologia (R$ 88.240,00)"),
    # --- SIC 2023
    perfil("jessica_miranda", "Jessica Evelyn Claudino Lobo de Miranda", ["multilinguagens"], ["arte_digital"],
           ["contemporaneidade"], [obra("PARA ADIAR O FIM DO MUNDO (ENCONTROS DE IDEIAS)", "arte_digital",
                                        descr="Encontros de ideias 'Para adiar o fim do mundo'.", fonte=SRC["sic2023"])],
           (0.45, 0.9), "evidencia_propria", fonte="SIC 2023 FIC Artes Integradas e Arte e Tecnologia (R$ 64.000,00)"),
    perfil("valeria_fagundes", "Valeria Pereira Fagundes", ["musica"], ["artes_visuais"],
           ["memoria"], [obra("ROCK PERNAMBUCANO EM 50 CAPAS", "musica",
                              descr="História do rock pernambucano por 50 capas de disco.",
                              fonte=SRC["sic2023"])],
           (0.55, 0.9), "evidencia_propria", fonte="SIC 2023 FIC Artes Integradas e Arte e Tecnologia (R$ 48.000,00)"),
    perfil("simone_ferreira", "Simone Ferreira", ["fotografia"], [],
           ["memoria"], [obra("BRINCANTES DA BURRINHA NAS MARGENS DO ATLÂNTICO NEGRO: ÁFRICA-BRASIL EM MOVIMENTO", "fotografia",
                              descr="Ensaio fotográfico sobre brincantes da Burrinha e o Atlântico negro.",
                              fonte=SRC["sic2023"])],
           (0.5, 0.9), "evidencia_propria", fonte="SIC 2023 FIC Fotografia (R$ 48.000,00)"),
    perfil("clareana_aroxa", "Clareana Arôxa", ["fotografia"], [],
           ["patrimonio"], [obra("DIGITALIZAÇÃO ALÉM DOS BAOBÁS", "fotografia",
                                 descr="Digitalização de acervos fotográficos.", fonte=SRC["sic2023"])],
           (0.4, 0.9), "evidencia_propria", fonte="SIC 2023 FIC Fotografia (R$ 48.000,00)"),
    perfil("robsmar_silva", "Robsmar da Silva (Mostra DNA Afro)", ["cultura_popular"], [],
           ["memoria", "ancestralidade"], [obra("MOSTRA DNA AFRO", "cultura_popular",
                                                descr="Mostra DNA Afro.", fonte=SRC["sic2023"])],
           (0.4, 0.9), "evidencia_propria", fonte="SIC 2023 FIC Artes Integradas e Arte e Tecnologia (R$ 40.000,00)"),
    # --- Multilinguagens / Virado / pesquisa / frevo / OBSERVA / FIDR (v2, com evidência própria)
    perfil("joao_fernando_silva", "João Fernando Dias da Silva", ["circo"], ["performance"],
           ["genero", "sexualidade"], [obra("MOSTRA QUEER DE ARTES PERFORMATIVAS - MAIS DO QUE LETRAS, PESSOAS! MAIS QUE ORGULHO, LUTA!",
                                            "circo", descr="Mostra queer de artes performativas.", fonte=SRC["multilinguagens"])],
           (0.55, 0.95), "evidencia_propria", fonte="Multilinguagens Recife Criativo PNAB 2026 (nota 10,0000)"),
    perfil("joao_lucas_cavalcanti", "João Lucas de Sá Leitão Cavalcanti", ["circo"], [],
           [], [obra("APRESENTAÇÕES NOVE TENTATIVAS DE NÃO SUCUMBIR", "circo",
                     descr="Apresentações circenses 'Nove tentativas de não sucumbir'.", fonte=SRC["multilinguagens"])],
           (0.5, 0.95), "evidencia_propria", fonte="Multilinguagens Recife Criativo PNAB 2026 (nota 9,9500)"),
    perfil("kananda_silva", "Kananda Maria Correia da Silva", ["musica"], [],
           ["genero", "cidade"], [obra("1º ENCONTRO MUNICIPAL DE FORMAÇÃO DA FRENTE DE MULHERES NO HIP HOP - RECIFE", "musica",
                                       descr="Encontro de formação da frente de mulheres no hip hop.",
                                       fonte=SRC["virado"])],
           (0.55, 0.95), "evidencia_resultado", pos=["comunitaria"],
           fonte="Virado na Periferia PNAB 2026, resultado preliminar (nota 8,5500)"),
    perfil("rarynne_barros", "Rarynne Francynne de Jesus Profiro Barros", ["musica"], [],
           ["cidade"], [obra("CIDADE SONORA", "musica", descr="Projeto de rap 'Cidade Sonora' (linguagem declarada: RAP).",
                             fonte=SRC["virado"])],
           (0.5, 0.95), "evidencia_resultado", fonte="Virado na Periferia PNAB 2026, resultado preliminar (nota 8,2333)"),
    perfil("claudemilson_souza", "Claudemilson Soares de Souza", ["danca"], [],
           [], [obra("CARREGO", "danca", descr="Pesquisa-criação em dança 'Carrego' (1º selecionado).",
                     fonte=SRC["solo"])],
           (0.45, 0.9), "evidencia_propria", fonte="O Solo do Outro 2026, resultado preliminar (1º selecionado)"),
    perfil("maria_pepe", "Maria Eduarda Sousa Pepe", ["teatro"], [],
           ["sexualidade"], [obra("ORGIA", "teatro", descr="Pesquisa em teatro 'Orgia' (1º selecionado).",
                                  fonte=SRC["aprendiz"])],
           (0.45, 0.9), "evidencia_propria", fonte="O Aprendiz em Cena 2026, resultado preliminar (1º selecionado)"),
    perfil("shermison_silva", "Shermison Henrique da Silva", ["danca"], [],
           ["patrimonio", "cultura_popular"],
           [obra("BOLSA DE FORMAÇÃO ESCOLA DE FREVO — PESQUISA-CRIAÇÃO: FREVO COMO METODOLOGIA CONTEMPORÂNEA", "danca",
                 techniques=["frevo_passo"], descr="Pesquisa-criação: frevo como metodologia contemporânea (1º selecionado).",
                 fonte=SRC["frevo"])],
           (0.5, 0.9), "evidencia_propria", fonte="Bolsa de Formação Escola de Frevo 2026 (1º selecionado)"),
    perfil("amanda_colaco", "Amanda Carolina Colaço", ["danca"], [],
           ["patrimonio"],
           [obra("BOLSA DE FORMAÇÃO ESCOLA DE FREVO — PESQUISA-CRIAÇÃO EM DANÇA", "danca",
                 techniques=["frevo_passo"], descr="Pesquisa-criação em dança frevo (2ª selecionada).",
                 fonte=SRC["frevo"])],
           (0.5, 0.9), "evidencia_propria", fonte="Bolsa de Formação Escola de Frevo 2026 (2ª selecionada)"),
    perfil("ana_neves", "Ana Neves", ["artes_visuais"], [],
           ["memoria", "territorio"],
           [obra("TROPICAL TRÓPICO: AQUI TUDO DERRETE", "artes_visuais", availability="obras_prontas",
                 descr="Primeira exposição individual, oito obras inéditas que entrelaçam memória e deslocamento no contexto do Sul Global.",
                 fonte=SRC["observa3_imprensa"])],
           (0.75, 0.8), "evidencia_propria",
           contexto={"primeira_exposicao_individual": True, "fonte": TVE},
           fonte="OBSERVA 3 — Torre Malakoff 2025 (selecionada; " + TVE + ")"),
    perfil("geoneide_brandao", "Geoneide Brandão", ["artes_visuais"], ["pintura"],
           ["genero", "sexualidade", "identidade", "afetividade"],
           [obra("ENTRE NÓS TODO O INDIZÍVEL SE FAZ PRESENTE", "pintura", techniques=["pintura"],
                 availability="obras_prontas",
                 descr="Pinturas sobre afetos e vivências dissidentes; identidade de gênero e sexualidade em perspectiva não-binária; pesquisa iniciada em 2020.",
                 fonte=SRC["observa3_imprensa"])],
           (0.85, 0.8), "evidencia_propria",
           contexto={"pesquisa_iniciada": 2020, "fonte": TVE},
           fonte="OBSERVA 3 — Torre Malakoff 2025 (selecionado; " + TVE + ")"),
    perfil("icaro_galvao", "Ícaro Galvão", ["artes_visuais"], ["fotografia"],
           ["memoria", "natureza"],
           [obra("ENCONTROS MONUMENTAIS", "fotografia", techniques=["fotografia_analogica", "video", "instalacao"],
                 availability="obras_prontas",
                 descr="Nove obras — entre elas um vídeo e peças em grandes formatos — em cianotipia colorida com infusões de vegetais; paisagem, memória e percepção.",
                 fonte=SRC["observa3_imprensa"]),
            obra("CIANOTIPIAS DE FORMAÇÕES ROSOSAS", "fotografia", techniques=["fotografia_analogica"],
                 availability="obras_prontas",
                 descr="Série em cianotipia colorida artesanalmente com infusões de vegetais (parte da pesquisa exibida no Observa 3).",
                 fonte=SRC["observa3_imprensa"]),
            obra("ATIVIDADES EDUCATIVAS — OFICINAS E VISITAS MEDIADAS", "fotografia", techniques=["instalacao"],
                 availability="obras_prontas",
                 descr="Programa educativo da ocupação: oficinas e visitas mediadas.",
                 fonte=SRC["observa3_imprensa"])],
           (0.85, 0.8), "evidencia_propria", years=10,
           fonte="OBSERVA 3 — Torre Malakoff 2025 (selecionado; " + TVE + ")"),
    perfil("luciana_borre", "Luciana Borre", ["artes_visuais"], ["multilinguagens"],
           ["afetividade"],
           [obra("?TODA VEZ QUE ME PERCO DE MIM?", "multilinguagens",
                 techniques=["bordado", "gravura", "videoarte", "instalacao"], availability="obras_prontas",
                 descr="Série com bordados, tapeçarias, gravuras, vídeo-arte e instalações; autoconhecimento e arte têxtil.",
                 fonte=SRC["observa3_imprensa"]),
            obra("BORDANDO AFETOS NA FORMAÇÃO DOCENTE (LIVRO)", "multilinguagens", techniques=["bordado"],
                 availability="obras_prontas",
                 descr="Livro de autoria da artista que inspirou a mostra.", fonte=SRC["observa3_imprensa"])],
           (0.85, 0.8), "evidencia_propria", years=12,
           fonte="OBSERVA 3 — Torre Malakoff 2025 (selecionada; " + TVE + ")"),
    perfil("paulo_oliveira", "Paulo Oliveira Quacula", ["artes_visuais"], ["escultura"],
           ["ancestralidade", "natureza"],
           [obra("ACERVO ESCULTÓRICO EM MADEIRAS NATURAIS", "escultura", techniques=["escultura", "madeira"],
                 availability="obras_prontas",
                 descr="Acervo escultórico a partir de madeiras naturais não extraídas; trajetória marcada por deslocamentos, mar e ancestralidade.",
                 fonte=SRC["observa3_imprensa"])],
           (0.8, 0.8), "evidencia_propria", years=30,
           contexto={"anos_atuacao_publicados": 30, "natural_de": "Moreno (RMR)", "fonte": TVE},
           fonte="OBSERVA 3 — Torre Malakoff 2025 (selecionado; " + TVE + ")"),
    perfil("maria_emilia_gomes", "Maria Emília da Cruz Gomes", ["danca"], [],
           [], [obra("COLIBRI", "danca", availability="obras_prontas",
                     descr="Espetáculo de dança 'Colibri' (1ª classificada na habilitação).", fonte=SRC["danca"]),
                obra("A[MAR]KALUNGA", "danca", availability="obras_prontas",
                     descr="Espetáculo de dança 'A[mar]kalunga' (4ª classificada).", fonte=SRC["danca"])],
           (0.6, 0.9), "evidencia_propria", fonte="29º FIDR 2026 (resultado final pós-recursos, ordem de classificação)"),
    perfil("roberto_macedo", "Roberto Alexandre Macedo", ["danca"], [],
           ["cidade"], [obra("O DONO DA RUA", "danca", availability="obras_prontas",
                             descr="Espetáculo de dança 'O dono da rua' (2º classificado).", fonte=SRC["danca"])],
           (0.5, 0.9), "evidencia_propria", fonte="29º FIDR 2026 (resultado final pós-recursos)"),
]

print(f"perfis manuais: {len(ARTISTAS)}")

# ---------------------------------------------------------------- EDITAIS
def edital(id, titulo, tipo, langs_core, langs_sup=None, ano=None, descricao="", fontes=None,
           reqs=None, resid="derivado", conceitos=None, faixa=None):
    reqs = reqs or []
    if resid:
        reqs.append({"fator": "territorio", "valor": "residencia_municipio", "strength": "explicit_mandatory",
                     "trecho": "\"possuam residência ou sede no Município do Recife, com comprovação\"",
                     "fonte": "Edital FIC/SIC 2025 (texto capturado; exigência do Sistema de Incentivo à Cultura aplicada às edições municipais)",
                     "status": "derivado" if resid == "derivado" else "verificado"})
    if conceitos:
        reqs.append({"fator": "conceito", "valor": conceitos, "strength": "preference", "trecho": conceitos.get("trecho", ""),
                     "fonte": conceitos.get("fonte", ""), "status": "verificado"})
    if faixa:
        reqs.append({"fator": "escala", "valor": faixa, "strength": "explicit_mandatory", "trecho": faixa["trecho"],
                     "fonte": faixa["fonte"], "status": "verificado"})
    langs = [{"value": langs_core, "role": "core", "strength": "explicit_mandatory"}]
    if langs_sup:
        langs.append({"value": langs_sup, "role": "support", "strength": "preference"})
    return {"id": id, "title": titulo, "municipio": "Recife", "ano": ano,
            "description_text": descricao,
            "opportunity_type": tipo,
            "eligibility": [{"type": "territory", "value": "city_recife", "strength": "explicit_mandatory"}],
            "artistic_requirements": {
                "languages": langs,
                "concepts": [{"value": conceitos["tokens"], "strength": "preference"}] if conceitos and conceitos.get("tokens") else [],
                "positioning": [], "niches": [], "techniques": [], "supports": []},
            "proposal_requirements": {"exhibition_formats": [], "unpublished_preferred": False},
            "requisitos_explicitos": reqs,
            "resultado_status": "verificado", "fontes": fontes or []}


EDITAIS = [
    edital("sic2024_fic_audiovisual", "FIC/SIC 2024 — Audiovisual", "financiamento_projetos", ["cinema", "audiovisual"], ano=2024,
           descricao="Seleção de projetos culturais de produção independente na linguagem audiovisual (Fundo de Incentivo à Cultura).",
           fontes=[SRC["sic2024_audio"]]),
    edital("sic2024_fic_musica", "FIC/SIC 2024 — Música", "financiamento_projetos", ["musica"], ano=2024,
           descricao="Seleção de projetos culturais de produção independente na linguagem música (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_fic_cultura_popular", "FIC/SIC 2024 — Cultura Popular", "financiamento_projetos", ["cultura_popular"], ano=2024,
           descricao="Seleção de projetos de cultura popular (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_fic_teatro", "FIC/SIC 2024 — Teatro", "financiamento_projetos", ["teatro"], ano=2024,
           descricao="Seleção de projetos de teatro (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_fic_artes_visuais", "FIC/SIC 2024 — Artes Visuais", "financiamento_projetos", ["artes_visuais"], ano=2024,
           descricao="Seleção de projetos de artes visuais (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_fic_circo", "FIC/SIC 2024 — Circo", "financiamento_projetos", ["circo"], ano=2024,
           descricao="Seleção de projetos de circo (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_fic_danca", "FIC/SIC 2024 — Dança", "financiamento_projetos", ["danca"], ano=2024,
           descricao="Seleção de projetos de dança (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_fic_artesanato", "FIC/SIC 2024 — Artesanato", "financiamento_projetos", ["artesanato"], ano=2024,
           descricao="Seleção de projetos de artesanato (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_fic_literatura", "FIC/SIC 2024 — Literatura", "financiamento_projetos", ["literatura"], ano=2024,
           descricao="Seleção de projetos de literatura (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_fic_fotografia", "FIC/SIC 2024 — Fotografia", "financiamento_projetos", ["fotografia"], ano=2024,
           descricao="Seleção de projetos de fotografia (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_fic_moda", "FIC/SIC 2024 — Design e Moda", "financiamento_projetos", ["moda"], ano=2024,
           descricao="Seleção de projetos de design e moda (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_fic_patrimonio", "FIC/SIC 2024 — Patrimônio Cultural e Museologia", "financiamento_projetos", ["patrimonio_cultural"], ano=2024,
           descricao="Seleção de projetos de patrimônio cultural e museologia (FIC).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2024_mic_audiovisual", "MIC/SIC 2024 — Audiovisual", "financiamento_projetos", ["cinema", "audiovisual"], ano=2024,
           descricao="Seleção de projetos audiovisuais (Mecenato de Incentivo à Cultura).", fontes=[SRC["sic2024_audio"]]),
    edital("sic2024_mic_teatro", "MIC/SIC 2024 — Teatro", "financiamento_projetos", ["teatro"], ano=2024,
           descricao="Seleção de projetos de teatro (Mecenato de Incentivo à Cultura).", fontes=[SRC["sic2024_exceto"]]),
    edital("sic2023_fic_integradas", "FIC/SIC 2023 — Artes Integradas e Arte e Tecnologia", "financiamento_projetos", ["multilinguagens", "arte_digital"], ano=2023,
           descricao="Seleção de projetos de artes culturais integradas e arte e tecnologia (FIC 2023).", fontes=[SRC["sic2023"]]),
    edital("sic2023_fic_fotografia", "FIC/SIC 2023 — Fotografia", "financiamento_projetos", ["fotografia"], ano=2023,
           descricao="Seleção de projetos de fotografia (FIC 2023).", fontes=[SRC["sic2023"]]),
    edital("multilinguagens_pnab2026", "Multilinguagens Recife Criativo — PNAB 2026", "fomento_projetos",
           ["cinema", "musica", "teatro", "danca", "circo", "cultura_popular", "artes_visuais", "literatura", "multilinguagens", "moda", "fotografia", "artesanato", "patrimonio_cultural", "gastronomia"], ano=2026,
           descricao="Fomento multilinguagens da PNAB (Recife Criativo, Lei Paulo Gustavo), com faixas de valor e reserva de aprovação por linguagem.",
           fontes=[SRC["multilinguagens"], SRC["errata_pnab"]],
           faixa={"trecho": "\"FAIXA 1: ATÉ R$ 20.000,00\" (coluna do resultado oficial)", "fonte": SRC["multilinguagens"]},
           reqs=[{"fator": "linguagem_reserva", "valor": "reserva_por_linguagem_e_cotas", "strength": "explicit_mandatory",
                  "trecho": "\"g) Publicação resultado preliminar dos projetos selecionados (considerando a análise artística, as cotas e a reserva de aprovação por linguagem)\"",
                  "fonte": SRC["errata_pnab"], "status": "verificado"}]),
    edital("virado_pnab2026_hiphop", "Recife Virado na Periferia — PNAB 2026 (Cultura Hip-Hop)", "fomento_projetos",
           ["musica", "artes_visuais", "danca"], ano=2026,
           descricao="Fomento da PNAB para cultura hip-hop na periferia do Recife, com cotas e distribuição por grupo/linguagem.",
           fontes=[SRC["virado"], SRC["errata_pnab"]],
           faixa={"trecho": "\"FAIXA 1: ATÉ R$ 20.000,00\" (coluna do resultado oficial)", "fonte": SRC["virado"]},
           reqs=[{"fator": "territorio", "valor": "periferia_recife", "strength": "preference",
                  "trecho": "\"O resultado aqui apresentado leva em consideração, além das notas de cada projeto, a distribuição dos recursos por Grupo/Li[nguagem]\"; autodeclarações publicadas no resultado",
                  "fonte": SRC["virado"], "status": "verificado"}]),
    edital("solo_do_outro_2026", "O Solo do Outro 2026 — Fomento de Pesquisa em Dança", "fomento_pesquisa", ["danca"], ano=2026,
           descricao="Fomento de pesquisa em dança a partir do diálogo com poetas e autoras negras de Pernambuco.",
           fontes=[SRC["solo"], SRC["edital_solo"]],
           reqs=[{"fator": "conceito", "valor": "dialogo_obras_autoras_negras_pe", "strength": "explicit_mandatory",
                  "trecho": "\"escolher outra autora, desde que a obra escolhida estabeleça um diálogo direto com produções de poetas e autoras negras do estado de Pernambuco, conforme descrito no item 1.2, sob pena de inabilitação\"",
                  "fonte": SRC["edital_solo"], "status": "verificado"},
                 {"fator": "tecnica", "valor": "traducao_corporal", "strength": "preference",
                  "trecho": "\"O projeto poderá se constituir a partir da aproximação, da reinterpretação e da tradução corporal dos textos, poéticas e contextos dessas autoras\"",
                  "fonte": SRC["edital_solo"], "status": "verificado"}]),
    edital("aprendiz_em_cena_2026", "O Aprendiz em Cena 2026 — Fomento de Pesquisa em Teatro", "fomento_pesquisa", ["teatro"], ano=2026,
           descricao="Fomento de pesquisa em teatro (comissão de análise artística por edital de credenciamento de pareceristas).",
           fontes=[SRC["aprendiz"]]),
    edital("bolsa_escola_frevo_2026", "Bolsa de Formação — Escola de Frevo 2026 (30 anos)", "formacao", ["danca"], ano=2026,
           descricao="Bolsa de formação ligada ao projeto de pesquisa-criação em dança 'Frevo como Metodologia Contemporânea'.",
           fontes=[SRC["frevo"], SRC["edital_frevo"]],
           reqs=[{"fator": "tecnica", "valor": "frevo_passo", "strength": "explicit_mandatory",
                  "trecho": "\"integrar o projeto de pesquisa-criação em dança 'Frevo como Metodologia Contemporânea', que deverá compor a programação do 29º Festival Internacional\"",
                  "fonte": SRC["edital_frevo"], "status": "verificado"},
                 {"fator": "conceito", "valor": ["tradio_contemporaneidade"], "strength": "preference",
                  "trecho": "\"articulando tradição e contemporaneidade, e promovendo o frevo como linguagem\"",
                  "fonte": SRC["edital_frevo"], "status": "verificado"}]),
    edital("observa3_malakoff_2025", "3º Edital OBSERVA — Torre Malakoff 2025 (ocupação expositiva)", "premiacao_ocupacao_expositiva",
           ["artes_visuais"], ano=2025,
           descricao="Ocupação expositiva do Observatório Cultural Torre Malakoff (Fundarpe) com artes visuais.",
           fontes=[SRC["observa3_imprensa"]],
           reqs=[{"fator": "formato", "valor": "exposicao", "strength": "explicit_mandatory",
                  "trecho": "\"Com entrada gratuita, a mostra ocupará o térreo e o primeiro andar do equipamento cultural gerido pela Fundação do Patrimônio Histórico e Artístico de Pernambuco (Fundarpe)\"",
                  "fonte": SRC["observa3_imprensa"], "status": "verificado"},
                 {"fator": "conceito", "valor": ["identidade", "territorio", "afetividade"], "strength": "preference",
                  "trecho": "\"No primeiro andar, quatro exposições distintas dialogam com temas como identidade, território e afetividade\"",
                  "fonte": SRC["observa3_imprensa"], "status": "verificado"},
                 {"fator": "territorio", "valor": "state_pe", "strength": "preference",
                  "trecho": "\"A iniciativa busca valorizar a produção artística contemporânea em Pernambuco\"",
                  "fonte": SRC["observa3_imprensa"], "status": "verificado"}]),
    edital("fidr_2026", "29º Festival Internacional de Dança do Recife — Convocatória 2026", "programacao_festival", ["danca"], ano=2026,
           descricao="Convocatória do 29º FIDR: espetáculos, mostras e oficinas relacionadas à linguagem da dança.",
           fontes=[SRC["danca"], SRC["edital_fidr"]],
           reqs=[{"fator": "formato", "valor": "palco_e_exposicao_danca", "strength": "explicit_mandatory",
                  "trecho": "\"inéditos e não inéditos, exposições relacionadas com a linguagem da dança (fotografia...\"; \"formato tradicional de palco\"",
                  "fonte": SRC["edital_fidr"], "status": "verificado"},
                 {"fator": "conceito", "valor": ["conceito_artistico_obra"], "strength": "preference",
                  "trecho": "\"a) Conceito artístico: será avaliado o conceito artístico da obra inscrita, no que se propõe dentro do seu gênero, observando as técnicas, dramaturgia e a criatividade\"",
                  "fonte": SRC["edital_fidr"], "status": "verificado"},
                 {"fator": "tecnica", "valor": ["consistencia_tecnica_genero"], "strength": "preference",
                  "trecho": "\"b) Procedimento artístico: será analisada a consistência técnica da obra, considerando o domínio das habilidades específicas relacionadas ao gênero\"",
                  "fonte": SRC["edital_fidr"], "status": "verificado"},
                 {"fator": "posicionamento", "valor": ["diversidade_corpos_genero_raca_territorio"], "strength": "preference",
                  "trecho": "\"c) Aspectos Socioculturais: ... diversidade de corpos, gênero, raça e territorialidade\" (+2 pontos por autodeclaração, item 8.2)",
                  "fonte": SRC["edital_fidr"], "status": "verificado"},
                 {"fator": "trajetoria", "valor": ["historico_profissional"], "strength": "preference",
                  "trecho": "\"d) Histórico profissional do Grupo ou Coletivo ou Artista: ... histórico e biografia, materiais publicados em mídias digitais\"",
                  "fonte": SRC["edital_fidr"], "status": "verificado"}]),
]

PENDENTES = json.load(open("/home/z/my-project/download/artistrank_benchmark_real/data_real/ground_truth.json",
                           encoding="utf-8"))["pendentes"]
print(f"editais verificados: {len(EDITAIS)} | pendentes: {len(PENDENTES)}")
json.dump({"artistas": ARTISTAS, "editais": EDITAIS, "pendentes": PENDENTES, "fontes": SRC},
          open(os.path.join(OUT, "_base_partial.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("base parcial gravada")


# ---------------------------------------------------------------- CANDIDATOS PROGRAMÁTICOS
def cand_id(insc, nome):
    return f"cand_{insc}" if insc else "cand_" + slug(nome or "sname")[:30]


def make_candidate(row, fonte_doc, lang_from_segment=True):
    seg = row.get("segmento") or ""
    lang = SEG_TOKEN.get(seg, slug(seg)[:22] if seg else None)
    auto = row.get("autodeclaracoes") or []
    ctx = {}
    if auto:
        labels = ["pessoa_negra", "pessoa_indigena", "pessoa_com_deficiencia", "outra"]
        ctx = {"autodeclarado": {labels[i]: (auto[i] == "SIM") for i in range(min(len(auto), len(labels)))},
               "fonte": f"colunas de autodeclaração do resultado oficial ({fonte_doc})"}
    titulo = row.get("titulo") or "Projeto cultural (título não extraído)"
    kw_map = [("quilombo", "ancestralidade"), ("terreiro", "ancestralidade"), ("afro", "ancestralidade"),
              ("mulher", "genero"), ("feminista", "genero"), ("mulheres", "genero"),
              ("queer", "sexualidade"), ("lgbt", "sexualidade"), ("trans", "genero"),
              ("periferia", "territorio"), ("favela", "territorio"), ("morro", "territorio"),
              ("memoria", "memoria"), ("patrimonio", "patrimonio"), ("acervo", "patrimonio"),
              ("museu", "patrimonio"), ("sagrad", "religiosidade"), ("religios", "religiosidade"),
              ("june", "cultura_popular"), ("maracatu", "cultura_popular"), ("coco", "cultura_popular"),
              ("candomble", "religiosidade"), ("indigena", "ancestralidade"), ("urbana", "cidade"),
              ("cidade", "cidade"), ("recife", "cidade")]
    kw_found = []
    tl = titulo.lower()
    for kw, cc in kw_map:
        if kw in tl and cc not in kw_found:
            kw_found.append(cc)
    return {"id": cand_id(row.get("inscricao"), row.get("proponente")),
            "nome": row.get("proponente") or "Proponente (nome não extraído)",
            "resume": f"Candidato(a) real em resultado oficial ({fonte_doc}).",
            "languages_main": [lang] if lang else [],
            "languages_secondary": [],
            "linguagem_origem": "evidencia_resultado" if lang else "edital",
            "positioning": [], "niches": [],
            "concepts": {"central": kw_found, "secondary": []},
            "territory": "city_recife", "years_active": 0,
            "trajectory": [],
            "artworks": [{"title": titulo, "language": lang or "multilinguagens", "techniques": [],
                          "supports": [], "concepts": kw_found, "scale": "medio", "availability": "projeto_novo",
                          "descricao": titulo, "fonte": fonte_doc}],
            "conceitos_origem": "titulo_do_projeto (palavra-chave) " if kw_found else "sem_evidencia",
            "availability": {"equipe": False, "documentacao_completa": True},
            "coverage": {"campos_preenchidos": 0.3, "qualidade_evidencias": 0.9,
                         "atualidade": 1.0, "confianca_extracao": 0.85},
            "contexto_trajetoria": ctx,
            "fonte": fonte_doc,
            "situacao": (row.get("situacao") or "Habilitado").lower()}


CANDIDATES = {}
CANDIDACY_MAP = defaultdict(list)  # edital_id -> [cand_id]

def add_candidate(row, edital_id, fonte_doc, situacao=None):
    c = make_candidate(row, fonte_doc)
    if situacao:
        c["situacao"] = situacao
    if c["nome"] and c["nome"] != "Proponente (nome não extraído)":
        CANDIDATES[c["id"]] = c
        CANDIDACY_MAP[edital_id].append(c["id"])
        return c["id"]
    return None

# Multilinguagens: 639 suplentes + 42 desclassificados; os demais selecionados viram aprovados adicionais
multi_sup, multi_desc, multi_aprov_add = [], [], []
for r in P["multilinguagens_final"]:
    if not r["situacao"]:
        continue
    if r["situacao"] == "Suplente":
        multi_sup.append(add_candidate(r, "multilinguagens_pnab2026", "Multilinguagens Recife Criativo PNAB 2026 — resultado final (PDF oficial)"))
    elif r["situacao"] == "Desclassificado":
        multi_desc.append(add_candidate(r, "multilinguagens_pnab2026", "Multilinguagens Recife Criativo PNAB 2026 — resultado final (PDF oficial)"))
    elif r["situacao"] == "Selecionado":
        multi_aprov_add.append((r, add_candidate(r, "multilinguagens_pnab2026", "Multilinguagens Recife Criativo PNAB 2026 — resultado final")))
multi_aprov_add = [(r, cid) for r, cid in multi_aprov_add if cid]

# Virado
vir_aprov_add = []
for r in P["virado2026"]:
    if r["situacao"] == "Suplente":
        add_candidate(r, "virado_pnab2026_hiphop", "Virado na Periferia PNAB 2026 — resultado preliminar")
    elif r["situacao"] == "Desclassificado":
        add_candidate(r, "virado_pnab2026_hiphop", "Virado na Periferia PNAB 2026 — resultado preliminar")
    elif r["situacao"] == "Selecionado":
        cid = add_candidate(r, "virado_pnab2026_hiphop", "Virado na Periferia PNAB 2026 — resultado preliminar")
        if cid:
            vir_aprov_add.append(cid)

# FIDR: habilitadas com ordem >= 3 (não ganhadoras); as duas primeiras são âncoras manuais
fidr_nao = [r for r in P["danca2026"] if r["ordem"] > 2 and r["proponente"]]
for r in fidr_nao:
    add_candidate({"inscricao": r["inscricao"], "titulo": r["titulo"].replace(" ESPETÁCULO HABILITADO", ""),
                   "segmento": "Dança", "proponente": r["proponente"], "autodeclaracoes": []},
                  "fidr_2026", "29º FIDR 2026 — resultado final pós-recursos (ordem de classificação)")

# SIC: aprovados adicionais + inabilitados
sic_add = defaultdict(list)
for doc, ed_prefix in (("sic2024_audio", "sic2024_"), ("sic2024_exceto", "sic2024_"), ("sic2023", "sic2023_")):
    for r in P[doc]["aprovados"]:
        if not (r["segmento"] and r.get("proponente")):
            continue
        seg = r["segmento"]
        lang = SEG_TOKEN.get(seg, slug(seg)[:22])
        if doc == "sic2023":
            eid = "sic2023_fic_integradas" if lang in ("multilinguagens", "arte_digital") else ("sic2023_fic_fotografia" if lang == "fotografia" else None)
        else:
            prog = (r["programa"] or "FIC").lower()
            if lang == "audiovisual" or seg == "Audiovisual":
                eid = f"sic2024_{prog}_audiovisual"
            elif seg in ("Teatro",) and prog == "mic":
                eid = "sic2024_mic_teatro"
            else:
                eid = f"sic2024_fic_{slug(seg)}" if prog == "fic" else None
                if eid == "sic2024_fic_design_e_moda":
                    eid = "sic2024_fic_moda"
                if eid == "sic2024_fic_patrimonio_cultural_e_museologia":
                    eid = "sic2024_fic_patrimonio"
        if eid and eid in {e["id"] for e in EDITAIS}:
            cid = add_candidate(r, eid, "Resultado final SIC 2023/2024 (PDF oficial)")
            if cid:
                sic_add[eid].append(cid)
inab_by_lang = defaultdict(list)
for r in P["sic2024_exceto"]["inabilitados"]:
    if r.get("segmento") and r.get("proponente"):
        lang = SEG_TOKEN.get(r["segmento"], slug(r["segmento"])[:22])
        eid = f"sic2024_fic_{slug(r['segmento'])}"
        eid = {"sic2024_fic_design_e_moda": "sic2024_fic_moda",
               "sic2024_fic_patrimonio_cultural_e_museologia": "sic2024_fic_patrimonio"}.get(eid, eid)
        if eid in {e["id"] for e in EDITAIS}:
            cid = add_candidate(r, eid, "Projetos inabilitados na 3ª fase — SIC 2024 (PDF oficial)")
            if cid:
                inab_by_lang[eid].append(cid)

# Solo / Aprendiz / Frevo pools
solo_pool = []
for r in P["solo2026_pool"]:
    if "Habilitad" in r["situacao"] and r["proponente"]:
        # correção manual dos 3 nomes/títulos verificados no layout do PDF
        pass
SOLO_FIX = [("20260572091", "Claudemilson Soares de Souza", "CARREGO", "selecionado"),
            ("20260571465", "Diego Nelson da Silva", "DO COMBATE AO AFETO", "habilitado"),
            ("20260572092", "Orunmillá Moura de Santana", "NÃO HÁ NADA COMO O MANGUE", "habilitado")]
for insc, nome, tit, sit in SOLO_FIX:
    if sit == "habilitado":
        add_candidate({"inscricao": insc, "titulo": tit, "segmento": "Dança", "proponente": nome, "autodeclaracoes": []},
                      "solo_do_outro_2026", "O Solo do Outro 2026 — resultado preliminar (PDF oficial)")

APRENDIZ_FIX = [("20260571180", "Maria Eduarda Sousa Pepe", "ORGIA", "selecionado"),
                ("20260572084", "Francisco Amorim de Oliveira Filho", "AUTO LÁ, DESEJO!", "habilitado"),
                ("20260572087", "Halberys Morais de Holanda", "ENTRE CARTAS E PONTES", "habilitado"),
                ("20260572089", "Daniel de Barro Santos", "GUIA SENTIMENTAL, SECRETO E ESTRANGEIRO - ORGIA", "habilitado"),
                ("20260571304", "Igor Karlos de Araujo e Silva", "RECIFE IN LOCO - ATORES E OBJETOS EM UMA FANTASIA MUSICAL", "habilitado")]
for insc, nome, tit, sit in APRENDIZ_FIX:
    if sit == "habilitado":
        add_candidate({"inscricao": insc, "titulo": tit, "segmento": "Teatro", "proponente": nome, "autodeclaracoes": []},
                      "aprendiz_em_cena_2026", "O Aprendiz em Cena 2026 — resultado preliminar (PDF oficial)")

frevo_pool_ids = []
for r in P["frevo_pool"]:
    if r["ordem"] > 2:  # as duas primeiras são âncoras; demais: selecionados adicionais (3-10) e habilitados (11-19)
        add_candidate({"inscricao": None, "titulo": "Bolsa de Formação Escola de Frevo 2026 (pesquisa-criação em dança)",
                       "segmento": "Dança", "proponente": r["proponente"], "autodeclaracoes": []},
                      "bolsa_escola_frevo_2026", "Bolsa de Formação Escola de Frevo 2026 — resultado final (PDF oficial)")

# ---------------------------------------------------------------- ANCHORS + aprovados adicionais por edital
ANCHORS = {
    "sic2024_fic_audiovisual": ["leao_producoes", "palas_alves"],
    "sic2024_fic_musica": ["inst_ricardo_brenand", "mr_plot"],
    "sic2024_fic_cultura_popular": ["maracatu_porto_rico", "alzenide_simoes"],
    "sic2024_fic_teatro": ["edivane_aguiar", "o_poste_solucoes"],
    "sic2024_fic_artes_visuais": ["marcelo_buarque", "julio_vasconcelos"],
    "sic2024_fic_circo": ["maria_fatima_pontes", "luiza_fontes"],
    "sic2024_fic_danca": ["walderlane_justino", "assoc_artistas_integrados"],
    "sic2024_fic_artesanato": ["cleonice_cardoso", "rosecleia_salvador"],
    "sic2024_fic_literatura": ["raiza_milfont", "gabriel_santana"],
    "sic2024_fic_fotografia": ["ventana_filmes", "vitor_lima"],
    "sic2024_fic_moda": ["juliana_araujo_silva", "natalia_borges"],
    "sic2024_fic_patrimonio": ["weldjane_araujo", "jose_rommel_silva"],
    "sic2024_mic_audiovisual": ["jaqueline_brandao", "diego_lopes"],
    "sic2024_mic_teatro": ["junior_artes_belo", "ruy_machado"],
    "sic2023_fic_integradas": ["jessica_miranda", "valeria_fagundes"],
    "sic2023_fic_fotografia": ["simone_ferreira", "clareana_aroxa"],
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

# aprovados adicionais: dos SIC (excl. âncoras por inscrição), multilinguagens selecionados, virado selecionados, frevo 3-10
anome = {a["id"]: norm_name(a["nome"]) for a in ARTISTAS}
aprov_adicionais = {}
for eid, cids in sic_add.items():
    keep = []
    for cid in cids:
        if norm_name(CANDIDATES[cid]["nome"]) not in [anome[a] for a in ANCHORS[eid]]:
            keep.append(cid)
        else:
            CANDIDATES.pop(cid, None)
    aprov_adicionais[eid] = keep
for r, cid in multi_aprov_add:
    if cid and cid not in [None]:
        aprov_adicionais.setdefault("multilinguagens_pnab2026", []).append(cid)
aprov_adicionais.setdefault("multilinguagens_pnab2026", [])
# remover os dois âncoras da lista de adicionais (estão com nome igual)
anchor_names = {norm_name(a["nome"]) for a in ARTISTAS if a["id"] in ANCHORS["multilinguagens_pnab2026"]}
aprov_adicionais["multilinguagens_pnab2026"] = [cid for cid in aprov_adicionais["multilinguagens_pnab2026"]
                                                if norm_name(CANDIDATES[cid]["nome"]) not in anchor_names]
aprov_adicionais["virado_pnab2026_hiphop"] = [cid for cid in vir_aprov_add
                                              if norm_name(CANDIDATES[cid]["nome"]) not in
                                              {norm_name(a["nome"]) for a in ARTISTAS if a["id"] in ANCHORS["virado_pnab2026_hiphop"]}]
aprov_adicionais["bolsa_escola_frevo_2026"] = [c["id"] for c in []
                                               ] + [cand_id(None, r["proponente"]) for r in P["frevo_pool"] if r["ordem"] > 2 and "Selecion" in r["situacao"]]
aprov_adicionais["fidr_2026"] = []

print("candidatos programáticos:", len(CANDIDATES))
print("multilinguagens: suplentes=.. descl=..")
n_sup = sum(1 for c in CANDIDATES.values() if c["situacao"] == "suplente")
n_desc = sum(1 for c in CANDIDATES.values() if c["situacao"] == "desclassificado")
n_hab = sum(1 for c in CANDIDATES.values() if c["situacao"] == "habilitado")
n_sel = sum(1 for c in CANDIDATES.values() if c["situacao"] == "selecionado")
print(f"  suplentes={n_sup} desclassificados={n_desc} habilitados={n_hab} aprovados_adicionais(selecionados)={n_sel}")

# ---------------------------------------------------------------- MULTI-OBRA: mesmo proponente em várias linhas do corpus
by_name = defaultdict(list)
def add_rows(rows, fonte):
    for r in rows:
        nm = norm_name(r.get("proponente"))
        if nm:
            by_name[nm].append({"titulo": r.get("titulo") or "", "seg": r.get("segmento") or "",
                                "sit": (r.get("situacao") or "").lower(), "fonte": fonte,
                                "insc": r.get("inscricao") or ""})
add_rows(P["multilinguagens_final"], "Multilinguagens PNAB 2026 (resultado final)")
add_rows(P["danca2026"], "29º FIDR 2026 (resultado final)")
add_rows(P["virado2026"], "Virado PNAB 2026 (resultado preliminar)")
for doc in ("sic2024_audio", "sic2024_exceto", "sic2023"):
    add_rows(P[doc]["aprovados"], "SIC 2023/2024 (resultado final)")
    add_rows(P[doc]["inabilitados"], "SIC 2024 inabilitados")

multi_artist_rows = {nm: rows for nm, rows in by_name.items() if len(rows) >= 3}
print("proponentes com >=3 propostas no corpus:", len(multi_artist_rows))

# Artistas já perfilados que ganham obras do harvest (Maria Emília já tem 2; outros abaixo)
extra_obras = {}
for nm, rows in multi_artist_rows.items():
    matches = [a for a in ARTISTAS if norm_name(a["nome"]).startswith(nm[:18]) or nm.startswith(norm_name(a["nome"])[:18])]
    for a in matches:
        have = {norm_name(w["title"]) for w in a["artworks"]}
        for r in rows:
            t = clean_title = r["titulo"].replace(" ESPETÁCULO HABILITADO", "").strip()
            if norm_name(t) and norm_name(t) not in have:
                a["artworks"].append(obra(t, SEG_TOKEN.get(r["seg"], "multilinguagens"),
                                          descr=f"Projeto inscrito no corpus (situacao: {r['sit']}).", fonte=r["fonte"]))
                have.add(norm_name(t))
        if len(a["artworks"]) >= 3:
            extra_obras[a["id"]] = len(a["artworks"])
print("artistas perfilados com >=3 obras após harvest:", extra_obras)

n_multi = sum(1 for a in ARTISTAS if len(a["artworks"]) >= 3)
print("total artistas multi-obra (>=3 obras):", n_multi)

# ---------------------------------------------------------------- SPLIT PRÉ-REGISTRADO (antes de qualquer resultado)
import hashlib
def is_test(edital_id):
    return int(hashlib.md5(edital_id.encode()).hexdigest(), 16) % 3 == 0
SPLIT = {e["id"]: ("teste" if is_test(e["id"]) else "treino") for e in EDITAIS}
print("split treino/teste:", {k: v for k, v in SPLIT.items()})
n_test = sum(1 for v in SPLIT.values() if v == "teste")
print(f"teste: {n_test}/{len(SPLIT)} editais")

GT = {
    "anchors": ANCHORS,
    "excluded": EXCLUDED,
    "aprovados_adicionais": aprov_adicionais,
    "candidatos": {cid: c.pop("situacao", None) and None or c["situacao"] if False else CANDIDATES[cid]["situacao"] for cid in []},
    "pendentes": PENDENTES,
    "split_treino_teste": SPLIT,
    "nota_split": "Split pré-registrado por hash md5(id)%3==0 antes de qualquer execução de métrica.",
}
json.dump({"artistas": ARTISTAS, "candidatos": CANDIDATES, "editais": EDITAIS, "gt": GT},
          open(os.path.join(OUT, "dataset_v3_full.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(GT, open(os.path.join(OUT, "ground_truth_v3.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(ARTISTAS, open(os.path.join(OUT, "artistas_v3.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(EDITAIS, open(os.path.join(OUT, "editais_v3.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(CANDIDATES, open(os.path.join(OUT, "candidatos_v3.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("gravado em", OUT)


# ---------------------------------------------------------------- LIMPEZA + PROMOÇÃO MULTI-OBRA (verificada)
# maracatu: remover obras colhidas por prefixo (eram de outras nações)
for a in ARTISTAS:
    if a["id"] == "maracatu_porto_rico":
        a["artworks"] = [w for w in a["artworks"] if "PORTO RICO SINFÔNICO" in w["title"]]
        a["artworks"].append(obra("APRESENTAÇÕES DA NAÇÃO DO MARACATU PORTO RICO (REPERTÓRIO TRADICIONAL)",
                                  "cultura_popular", techniques=["percussao"], availability="obras_prontas",
                                  descr="Repertório tradicional do maracatu Porto Rico (nação com atividade contínua; fontes: resultados do corpus).",
                                  fonte=SRC["sic2024_exceto"]))

MULTI_PROMOVIDOS = [
    perfil("priscila_pereira", "Priscila do Nascimento Pereira", ["cinema"], ["audiovisual"],
           [],
           [obra("RASURA", "audiovisual", descr="Projeto audiovisual 'Rasura' (suplente no Multilinguagens).", fonte=SRC["multilinguagens"]),
            obra("O CONCEITO DO AMOR – UM BREGA MUSICAL", "audiovisual",
                 descr="Projeto audiovisual 'O conceito do amor — um brega musical' (suplente no Multilinguagens).", fonte=SRC["multilinguagens"]),
            obra("CHÁ DE CALCINHA", "audiovisual",
                 descr="Projeto audiovisual 'Chá de Calcinha' (aprovado no FIC/SIC 2024 Audiovisual, R$ 101.700,00).", fonte=SRC["sic2024_audio"])],
           (0.55, 0.9), "evidencia_propria",
           fonte="Multilinguagens PNAB 2026 (2 suplências) + SIC 2024 FIC Audiovisual (aprovado, R$ 101.700)"),
    perfil("roberto_carlos_sousa", "Roberto Carlos Gomes de Sousa", ["danca"], ["cultura_popular"],
           [],
           [obra("TERREIRO TRAJETÓRIA", "danca", availability="obras_prontas",
                 descr="Espetáculo de dança 'Terreiro Trajetória' (habilitado no 29º FIDR).", fonte=SRC["danca"]),
            obra("PISADAS", "danca", availability="obras_prontas",
                 descr="Espetáculo de dança 'Pisadas' (habilitado no 29º FIDR).", fonte=SRC["danca"]),
            obra("PLAY NA CULTURA POPULAR - PORTAL RC10 2027", "cultura_popular",
                 descr="Projeto de cultura popular 'Play na Cultura Popular — Portal RC10 2027' (suplente no Multilinguagens).",
                 fonte=SRC["multilinguagens"])],
           (0.55, 0.9), "evidencia_propria",
           fonte="29º FIDR 2026 (2 habilitações) + Multilinguagens PNAB 2026 (1 suplência)"),
    perfil("marcos_castro_paz", "Marcos Castro da Paz Junior", ["cinema"], ["audiovisual"],
           [],
           [obra("O QUE NOS FALTA!?", "audiovisual", descr="Projeto audiovisual 'O que nos falta!?' (suplente no Multilinguagens).", fonte=SRC["multilinguagens"]),
            obra("O DESEJO DE CATIRINA (CURTA-METRAGEM)", "audiovisual",
                 descr="Curta-metragem 'O desejo de Catirina' (suplente no Multilinguagens).", fonte=SRC["multilinguagens"])],
           (0.5, 0.9), "evidencia_propria", fonte="Multilinguagens PNAB 2026 (2 suplências)"),
    perfil("nacao_encanto_pina", "Nação do Maracatu Encanto do Pina", ["cultura_popular"], ["literatura"],
           ["cultura_popular"],
           [obra("RUFA O BAQUE ENCANTADO: OFICINAS DA NAÇÃO DO MARACATU ENCANTO DO PINA", "cultura_popular",
                 techniques=["percussao"], descr="Oficinas do maracatu Encanto do Pina (suplente no Multilinguagens).", fonte=SRC["multilinguagens"]),
            obra("POESIA EM MOVIMENTO: O FAZER LITERÁRIO FEMININO EM PERNAMBUCO", "literatura",
                 descr="Projeto literário 'Poesia em movimento' (suplente no Multilinguagens).", fonte=SRC["multilinguagens"])],
           (0.5, 0.9), "evidencia_propria", fonte="Multilinguagens PNAB 2026 (2 suplências)"),
]
ARTISTAS.extend(MULTI_PROMOVIDOS)

# remover candidatos duplicados (os cand_ das pessoas promovidas) e mapear candidaturas por artista
promoted = {norm_name(a["nome"]).split(",")[0]: a for a in MULTI_PROMOVIDOS}
def match_promoted(nome):
    nm = norm_name(nome)
    for key, a in promoted.items():
        if key and (key in nm or nm in key):
            return a
    return None

dup_ids = [cid for cid, c in CANDIDATES.items() if match_promoted(c["nome"])]
for cid in dup_ids:
    CANDIDATES.pop(cid, None)

CANDIDACIES = defaultdict(list)  # artist_id -> [(edital_id, situacao)]
def reg_cand(aid, eid, sit, fonte_row):
    CANDIDACIES[aid].append({"edital": eid, "situacao": sit, "fonte": fonte_row})
reg_cand("priscila_pereira", "multilinguagens_pnab2026", "suplente", "Multilinguagens PNAB 2026 (RASURA; O CONCEITO DO AMOR)")
reg_cand("roberto_carlos_sousa", "fidr_2026", "habilitado", "29º FIDR 2026 (TERREIRO TRAJETÓRIA; PISADAS)")
reg_cand("roberto_carlos_sousa", "multilinguagens_pnab2026", "suplente", "Multilinguagens PNAB 2026 (PLAY RC10)")
reg_cand("marcos_castro_paz", "multilinguagens_pnab2026", "suplente", "Multilinguagens PNAB 2026 (2 projetos)")
reg_cand("nacao_encanto_pina", "multilinguagens_pnab2026", "suplente", "Multilinguagens PNAB 2026 (RUFA O BAQUE; POESIA EM MOVIMENTO)")
aprov_adicionais.setdefault("sic2024_fic_audiovisual", []).append("priscila_pereira")



# ---------------------------------------------------------------- META por âncora: URL + posição (regra 3 do mandato)
EDURL = {e["id"]: (e["fontes"][0] if e["fontes"] else "") for e in EDITAIS}
TVEU = SRC["observa3_imprensa"]
ANCHOR_META = {
    "leao_producoes": ("sic2024_fic_audiovisual", "1º maior valor entre os aprovados (R$ 179.600,00)"),
    "palas_alves": ("sic2024_fic_audiovisual", "2º maior valor entre os aprovados (R$ 105.100,00)"),
    "inst_ricardo_brenand": ("sic2024_fic_musica", "1º maior valor entre os aprovados (R$ 165.000,00)"),
    "mr_plot": ("sic2024_fic_musica", "2º maior valor entre os aprovados (R$ 165.000,00)"),
    "maracatu_porto_rico": ("sic2024_fic_cultura_popular", "1º maior valor entre os aprovados (R$ 130.000,00)"),
    "alzenide_simoes": ("sic2024_fic_cultura_popular", "2º maior valor entre os aprovados (R$ 110.000,00)"),
    "edivane_aguiar": ("sic2024_fic_teatro", "1º maior valor entre os aprovados FIC (R$ 100.000,00)"),
    "o_poste_solucoes": ("sic2024_fic_teatro", "2º maior valor entre os aprovados FIC (R$ 96.839,00)"),
    "marcelo_buarque": ("sic2024_fic_artes_visuais", "1º maior valor entre os aprovados (R$ 63.000,00)"),
    "julio_vasconcelos": ("sic2024_fic_artes_visuais", "2º maior valor entre os aprovados (R$ 62.998,00)"),
    "maria_fatima_pontes": ("sic2024_fic_circo", "1º maior valor entre os aprovados (R$ 59.750,00)"),
    "luiza_fontes": ("sic2024_fic_circo", "2º maior valor entre os aprovados (R$ 54.000,00)"),
    "walderlane_justino": ("sic2024_fic_danca", "1º maior valor entre os aprovados (R$ 60.000,00)"),
    "assoc_artistas_integrados": ("sic2024_fic_danca", "2º maior valor entre os aprovados (R$ 60.000,00)"),
    "cleonice_cardoso": ("sic2024_fic_artesanato", "1º maior valor entre os aprovados (R$ 60.000,00)"),
    "rosecleia_salvador": ("sic2024_fic_artesanato", "2º maior valor entre os aprovados (R$ 48.000,00)"),
    "raiza_milfont": ("sic2024_fic_literatura", "1º maior valor entre os aprovados (R$ 48.000,00)"),
    "gabriel_santana": ("sic2024_fic_literatura", "2º maior valor entre os aprovados (R$ 48.000,00)"),
    "ventana_filmes": ("sic2024_fic_fotografia", "1º maior valor entre os aprovados (R$ 49.000,00)"),
    "vitor_lima": ("sic2024_fic_fotografia", "2º maior valor entre os aprovados (R$ 48.000,00)"),
    "juliana_araujo_silva": ("sic2024_fic_moda", "1º maior valor entre os aprovados (R$ 48.000,00)"),
    "natalia_borges": ("sic2024_fic_moda", "2º maior valor entre os aprovados (R$ 48.000,00)"),
    "weldjane_araujo": ("sic2024_fic_patrimonio", "1º maior valor entre os aprovados (R$ 89.940,00)"),
    "jose_rommel_silva": ("sic2024_fic_patrimonio", "2º maior valor entre os aprovados (R$ 88.240,00)"),
    "jaqueline_brandao": ("sic2024_mic_audiovisual", "1º maior valor entre os aprovados MIC (R$ 500.000,00)"),
    "diego_lopes": ("sic2024_mic_audiovisual", "2º maior valor entre os aprovados MIC (R$ 500.000,00)"),
    "junior_artes_belo": ("sic2024_mic_teatro", "1º maior valor entre os aprovados MIC (R$ 150.000,00)"),
    "ruy_machado": ("sic2024_mic_teatro", "2º maior valor entre os aprovados MIC (R$ 79.990,00)"),
    "jessica_miranda": ("sic2023_fic_integradas", "1º maior valor entre os aprovados (R$ 64.000,00)"),
    "valeria_fagundes": ("sic2023_fic_integradas", "2º maior valor entre os aprovados (R$ 48.000,00)"),
    "simone_ferreira": ("sic2023_fic_fotografia", "1º maior valor entre os aprovados (R$ 48.000,00)"),
    "clareana_aroxa": ("sic2023_fic_fotografia", "2º maior valor entre os aprovados (R$ 48.000,00)"),
    "joao_fernando_silva": ("multilinguagens_pnab2026", "1º selecionado (nota 10,0000)"),
    "joao_lucas_cavalcanti": ("multilinguagens_pnab2026", "2º selecionado (nota 9,9500)"),
    "kananda_silva": ("virado_pnab2026_hiphop", "1º selecionado (nota 8,5500)"),
    "rarynne_barros": ("virado_pnab2026_hiphop", "2º selecionado (nota 8,2333)"),
    "claudemilson_souza": ("solo_do_outro_2026", "1º selecionado"),
    "maria_pepe": ("aprendiz_em_cena_2026", "1º selecionado"),
    "shermison_silva": ("bolsa_escola_frevo_2026", "1º selecionado (ordem de classificação)"),
    "amanda_colaco": ("bolsa_escola_frevo_2026", "2º selecionado (ordem de classificação)"),
    "ana_neves": ("observa3_malakoff_2025", "selecionada (ocupação do térreo/1º andar; ordem de citação na imprensa)"),
    "geoneide_brandao": ("observa3_malakoff_2025", "selecionado (ocupação do térreo/1º andar; ordem de citação na imprensa)"),
    "maria_emilia_gomes": ("fidr_2026", "1ª classificada na habilitação final pós-recursos"),
    "roberto_macedo": ("fidr_2026", "2º classificado na habilitação final pós-recursos"),
}
for aid, (eid, pos) in ANCHOR_META.items():
    a = next(x for x in ARTISTAS if x["id"] == aid)
    a["fonte_url"] = EDURL.get(eid, TVEU if "observa" in eid else "")
    a["posicao_na_selecao"] = pos
    if "observa" in eid:
        a["fonte_url"] = TVEU
print("meta de âncoras aplicada:", len(ANCHOR_META))

n_multi = [a["id"] for a in ARTISTAS if len(a["artworks"]) >= 3]
n_multi2 = [a["id"] for a in ARTISTAS if len(a["artworks"]) == 2]
for eid in list(CANDIDACY_MAP.keys()):
    CANDIDACY_MAP[eid] = [cid for cid in CANDIDACY_MAP[eid] if cid in CANDIDATES]
# limpar referências órfãs em aprovados_adicionais (pessoas promovidas perderam cand_)
for eid in list(aprov_adicionais.keys()):
    aprov_adicionais[eid] = [cid for cid in aprov_adicionais[eid] if cid in CANDIDATES or cid in {a["id"] for a in ARTISTAS}]
print("multi-obra >=3:", n_multi)
print("multi-obra =2:", n_multi2)
print("candidatos após dedup:", len(CANDIDATES))
json.dump({"artistas": ARTISTAS, "candidatos": CANDIDATES, "editais": EDITAIS, "gt": GT,
           "candidacias_promovidos": {k: v for k, v in CANDIDACIES.items()},
           "candidacy_map": {k: v for k, v in CANDIDACY_MAP.items()}},
          open(os.path.join(OUT, "dataset_v3_full.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(ARTISTAS, open(os.path.join(OUT, "artistas_v3.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("gravado FINAL:", OUT)
