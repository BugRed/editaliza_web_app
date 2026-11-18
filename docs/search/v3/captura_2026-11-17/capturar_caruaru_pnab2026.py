# -*- coding: utf-8 -*-
"""Captura a lista final de contemplados do Edital de Chamamento nº 001/2026 (Anastácio Rodrigues, Caruaru).

Baixa o PDF oficial, grava o SHA-256 e extrai um registro por contemplado. O PDF não separa de forma confiável o
nome do projeto do nome do proponente (texto centrado em células), então `texto_publicado` guarda os dois juntos,
como saem do documento; nada é adivinhado. Uso: python3 -I capturar_caruaru_pnab2026.py
"""
import hashlib
import json
import os
import re
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
URL = ("https://mapacultural.caruaru.pe.gov.br/storage/anexoEditais/PNAB%20CICLO%202/"
       "lista_final_de_contemplados_pnab_2026_edital_001_anastacio_rodrigues_anexo_1790693383.pdf")
OUT = os.path.join(HERE, "caruaru_pnab2026_anastacio.json")

RECORD = re.compile(r"^\s*(\d{2})\s{2,}(.*)$")
CATEGORY = re.compile(r"^\s*CATEGORIA\s+([A-H])\b")
VALUE = re.compile(r"R\$\s*([\d.]+,\d{2})")
DOC = re.compile(r"(XXX\.\d{3}\.\d{3}-XX|XXX\.\d{3}\.\d{3}XX|\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}|\d{2}\.\d{3}\.\d{3}-\d{4}/\d{2})")


def baixar(destino: str) -> str:
    subprocess.run(["curl", "-sSL", "-m", "90", "-A", "Mozilla/5.0", "-o", destino, URL], check=True)
    return hashlib.sha256(open(destino, "rb").read()).hexdigest()


def extrair(pdf: str) -> list[dict]:
    texto = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True, check=True).stdout
    registros, atual, categoria = [], None, None
    for linha in texto.splitlines():
        cat = CATEGORY.match(linha)
        if cat:
            categoria, atual = cat.group(1), None
            continue
        if "CLASSIFICAÇÃO" in linha or not linha.strip() or categoria is None:
            continue
        rec = RECORD.match(linha)
        if rec:
            atual = {"categoria": categoria, "classificacao": int(rec.group(1)), "linhas": [rec.group(2).strip()]}
            registros.append(atual)
        elif atual is not None:
            atual["linhas"].append(linha.strip())
    saida = []
    for r in registros:
        bloco = " ".join(r["linhas"])
        valor = VALUE.search(bloco)
        doc = DOC.search(bloco)
        resultado = "HABILITADO/CONTEMPLADO" if "HABILITADO/CONTEMPLADO" in bloco else None
        limpo = re.sub(r"\s+", " ", VALUE.sub("", DOC.sub("", bloco.replace("HABILITADO/CONTEMPLADO", "")))).strip()
        saida.append({"categoria": r["categoria"], "classificacao": r["classificacao"],
                      "valor_reais": float(valor.group(1).replace(".", "").replace(",", ".")) if valor else None,
                      "cpf_cnpj_publicado": doc.group(1) if doc else None, "resultado": resultado,
                      "texto_publicado": limpo})
    return saida


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        pdf = os.path.join(tmp, "lista.pdf")
        sha = baixar(pdf)
        registros = extrair(pdf)
    por_categoria = {}
    for r in registros:
        por_categoria[r["categoria"]] = por_categoria.get(r["categoria"], 0) + 1
    json.dump({"edital": "caruaru_pnab2026_anastacio", "url": URL, "sha256": sha, "n_contemplados": len(registros),
               "por_categoria": por_categoria, "contemplados": registros},
              open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(registros)} contemplados {por_categoria} sha256={sha[:16]}…")


if __name__ == "__main__":
    main()
