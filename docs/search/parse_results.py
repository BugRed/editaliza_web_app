# -*- coding: utf-8 -*-
"""Parse dos PDFs de resultado (Recife) -> tabela mestre de aprovados/selecionados."""
import json
import re

TXT = "/tmp/bench_txt"
OUT = "/home/z/my-project/scripts/artistrank_v2/parse_out.json"


def clean(s):
    return re.sub(r"\s+", " ", s).strip()


def parse_sic(path):
    """FIC/MIC aprovados: INSCRIÇÃO | PROJETO | PROPONENTE | (SEGMENTO) | VALOR."""
    rows = []
    seg = None
    txt = open(path, encoding="utf-8", errors="ignore").read()
    for raw in txt.splitlines():
        line = raw.strip()
        m = re.match(r"^([A-ZÀ-Ü][A-ZÀ-Ü\s/&()-]{4,80})$", line)
        if m and not re.search(r"\d", line):
            cand = clean(m.group(1))
            if any(k in cand for k in ["CULTURA", "ARTESANATO", "MÚSICA", "MUSICA", "TEATRO", "DANÇA", "DANCA", "LITERATURA", "VISUAL", "CIRCO", "AUDIOVISUAL", "POPULAR", "PATRIMÔNIO", "PATRIMONIO", "GASTRONOMIA", "CRAFT", "FOTOGRAFIA", "INTEGRADAS"]):
                seg = cand
                continue
        m = re.match(r"^(\d{8,14})\s+(.+?)(?:\s{2,}|\s)(.+?)(?:\s{2,}[A-ZÀ-Ü][A-ZÀ-Ü /]{3,40})?\s+(R\$ ?[\d.]+,\d{2})\s*$", line)
        if not m:
            m = re.match(r"^(\d{8,14})\s+(.+?)\s{2,}(.+?)\s{2,}.*?(R\$ ?[\d.]+,\d{2})\s*$", line)
        if m:
            insc, proj, prop, val = m.group(1), clean(m.group(2)), clean(m.group(3)), m.group(4)
            if len(proj) > 4 and len(prop) > 3:
                rows.append({"inscricao": insc, "projeto": proj, "proponente": prop, "segmento": seg, "valor": val})
    return rows


def parse_multilinguagens(path):
    """Multilinguagens: linha contém insc, título, segmento, valor, proponente, nota, SELECIONADO."""
    rows = []
    txt = open(path, encoding="utf-8", errors="ignore").read()
    for line in txt.splitlines():
        line = line.strip()
        if "SELECIONADO" not in line and "INABILITADO" not in line and "HABILITADO" not in line:
            continue
        m = re.match(r"^(2026\d{6})\s+(.*?)\s{2,}([A-ZÀ-Ü][A-ZÀ-Ü\s]+?)\s{2,}R\$ ?([\d.]+,\d{2}).*?([\d],[\d]{4})\s+(SELECIONADO|INABILITADO|HABILITADO)", line)
        if m:
            insc, titulo, segm, val, nota, sit = m.groups()
            rest = line
            # proponente costuma aparecer após o valor/faixa
            after = re.split(r"FAIXA \d", rest)
            prop = None
            if len(after) > 1:
                tail = re.sub(r"SIM|NÃO|[\d],[\d]{4}|SELECIONADO|INABILITADO|HABILITADO", " ", after[-1])
                tail = re.sub(r"\s+", " ", tail).strip(" ")
                # remove colunas de faixa residuais
                tail = re.sub(r"^[\d\s]+", "", tail)
                if len(tail) > 5:
                    prop = tail[:80].strip()
            rows.append({"inscricao": insc, "projeto": clean(titulo)[:120], "proponente": prop, "segmento": clean(segm).title(), "valor": val, "nota": nota, "situacao": sit})
    return rows


def parse_virado_hiphop(path):
    return parse_multilinguagens(path)


def parse_fomento_2026(path):
    """Solo/Aprendiz: Inscrição | Título | Proponente | Situação (Selecionado/Habilitado)."""
    rows = []
    txt = open(path, encoding="utf-8", errors="ignore").read()
    lines = txt.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        m = re.match(r"^(2026\d{6})\s+(.*)$", line)
        if m:
            insc = m.group(1)
            rest = m.group(2)
            # título pode continuar na próxima linha(s) até coluna proponente/situação
            block = rest
            j = i + 1
            while j < len(lines) and not re.search(r"Selecionad[oa]|Habilitad[oa]", block):
                block += " " + lines[j].strip()
                j += 1
            if re.search(r"Selecionad[oa]|Habilitad[oa]", block):
                m2 = re.match(r"^(.*?)\s{2,}(.*?)\s{2,}(Selecionad[oa]|Habilitad[oa])", clean(block))
                if m2:
                    rows.append({"inscricao": insc, "projeto": clean(m2.group(1)), "proponente": clean(m2.group(2)), "situacao": m2.group(3)})
                    i = j
                    continue
        i += 1
    return rows


def parse_frevo(path):
    rows = []
    txt = open(path, encoding="utf-8", errors="ignore").read()
    lines = txt.splitlines()
    for i, line in enumerate(lines):
        m = re.match(r"^\s*(\d+)\s+([A-ZÀ-Ü][^\n]{5,60}?)\s+(Selecionado|Selecionada|Habilitado|Habilitada)\s*$", line.strip())
        if m:
            rows.append({"ordem": int(m.group(1)), "proponente": clean(m.group(2)), "situacao": m.group(3)})
    return rows


def parse_danca(path):
    """FIDR 2026: INSCRIÇÃO | TÍTULO | TIPO | PROPONENTE | SITUAÇÃO (HABILITADO), ordem de classificação."""
    rows = []
    txt = open(path, encoding="utf-8", errors="ignore").read()
    lines = txt.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        m = re.match(r"^(2026\d{6})\s+(.*)$", line)
        if m:
            insc = m.group(1)
            block = m.group(2)
            j = i + 1
            while j < len(lines) and not re.search(r"HABILITADO|INABILITADO|DESCLASSIFICADO", block, re.I):
                block += " | " + lines[j].strip()
                j += 1
            if re.search(r"HABILITADO", block, re.I):
                parts = [clean(p) for p in block.split("|")]
                # partes: titulo, tipo, proponente(+situação colada)
                titulo = parts[0]
                proponente = None
                tipo = parts[1] if len(parts) > 1 else None
                if len(parts) > 2:
                    prop = re.sub(r"HABILITADO.*", "", parts[2]).strip()
                    proponente = prop if len(prop) > 3 else None
                if not proponente and len(parts) > 3:
                    proponente = re.sub(r"HABILITADO.*", "", parts[3]).strip()
                if proponente and len(proponente) > 3:
                    rows.append({"inscricao": insc, "projeto": titulo[:110], "tipo": tipo, "proponente": proponente, "situacao": "HABILITADO"})
                    i = j
                    continue
        i += 1
    return rows


if __name__ == "__main__":
    out = {}
    out["sic2023"] = parse_sic(f"{TXT}/sic2023.txt")
    out["sic2024_audiovisual"] = parse_sic(f"{TXT}/sic2024_audiovisual.txt")
    out["sic2024_excetoaudio"] = parse_sic(f"{TXT}/sic2024_excetoaudio.txt")
    out["multilinguagens2026"] = parse_multilinguagens(f"{TXT}/multilinguagens2026.txt")
    out["virado_hiphop2026"] = parse_virado_hiphop(f"{TXT}/virado_hiphop2026.txt")
    out["solo2026"] = parse_fomento_2026(f"{TXT}/solo2026.txt")
    out["aprendiz2026"] = parse_fomento_2026(f"{TXT}/aprendiz2026.txt")
    out["frevo2026"] = parse_frevo(f"{TXT}/frevo.txt")
    out["danca2026"] = parse_danca(f"{TXT}/danca2026.txt")
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for k, v in out.items():
        print(f"\n### {k}: {len(v)} linhas")
        for r in v[:6]:
            print("  ", json.dumps(r, ensure_ascii=False)[:200])
