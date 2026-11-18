# -*- coding: utf-8 -*-
"""Parser master v3: multi_result (Multilinguagens 836), FIDR completo, SIC FIC/MIC
2023/2024 por linguagem (aprovados + inabilitados), virado 2026. Saída: parse_out_v3.json."""
import json
import re
from collections import Counter

PDF_DIR = "/home/z/my-project/scripts/artistrank_v3/pdf"
OUT = "/home/z/my-project/scripts/artistrank_v3/parse_out_v3.json"

SEGMENTOS = ["PATRIMÔNIO CULTURAL E MUSEUOGLIA", "PATRIMÔNIO CULTURAL E MUSEOLOGIA", "ARTES CULTURAIS INTEGRADAS",
             "CULTURA POPULAR", "AUDIOVISUAL", "ARTES VISUAIS", "ARTESANATO", "LITERATURA", "MÚSICA", "MUSICA",
             "TEATRO", "DANÇA", "DANCA", "CIRCO", "MODA", "FOTOGRAFIA", "GASTRONOMIA", "ARTES INTEGRADAS"]
SITUACOES = ["SELECIONADO", "SUPLENTE", "DESCLASSIFICADO", "INABILITADO", "HABILITADO"]
NAME_PARTICLES = {"DE", "DA", "DO", "DAS", "DOS", "E", "JR", "JUNIOR", "FILHO", "NETO", "PJ", "LTDA", "ME"}


def clean(s):
    return re.sub(r"\s+", " ", s).strip()


def strip_cpf(name):
    n = re.sub(r"\d{5,}", " ", name)
    n = re.sub(r"\s*-\s*PJ\s*$", " ", n)
    return clean(n)


def find_segmento(text):
    up = clean(text).upper()
    for seg in SEGMENTOS:
        if seg in up:
            return seg.title().replace("E Museuoglia", "E Museologia")
    return None


def is_name_token(tk):
    words = tk.split()
    if len(words) < 2 or len(words) > 7:
        return False
    for w in words:
        if not (re.match(r"^[A-ZÀ-Ü][A-ZÀ-Ü\.\'\-]*$", w) or w.upper() in NAME_PARTICLES):
            return False
    return True


# ---------------------------------------------------------------- multilinguagens / virado

def parse_multilinguagens(path):
    lines = open(path, encoding="utf-8", errors="ignore").read().splitlines()
    anchors = [i for i, ln in enumerate(lines) if re.match(r"^\s*2026\d{7}\s", ln)]
    rows = []
    for k, ai in enumerate(anchors):
        hi = min(len(lines), anchors[k + 1] if k + 1 < len(anchors) else len(lines))
        block = lines[max(0, ai - 3):min(ai + 5, hi)]
        anchor_line = lines[ai]
        sit = None
        for s in SITUACOES:
            if re.search(rf"\b{s}\b", anchor_line) or any(re.search(rf"\b{s}\b", b) for b in block):
                sit = s
                break
        nota_m = re.search(r"(\d,\d{4})\s+(?:SELECIONADO|SUPLENTE|DESCLASSIFICADO|INABILITADO|HABILITADO)", anchor_line)
        # autodeclarações: sequência SIM/NÃO após a coluna de proponente
        auto_m = re.findall(r"\b(SIM|NÃO)\b", anchor_line)
        insc_m = re.match(r"^\s*(2026\d{7})\s+(.*?)\s{2,}[A-ZÀ-Ü]", anchor_line)
        insc = insc_m.group(1) if insc_m else None
        titulo = clean(insc_m.group(2)) if insc_m and insc_m.group(2) else ""
        for b in block[:3]:
            if b is anchor_line:
                continue
            t = clean(b)
            if not t or re.search(r"SIM|NÃO|SUPLENTE|SELECIONADO|DESCLASSIFICADO|INABILITADO|HABILITADO|\d,\d{4}|FAIXA|R\$\s*\d", t):
                continue
            if find_segmento(t):
                continue
            if len(t) > 8 and t.upper() == t and len(t.split()) >= 2:
                titulo = (t + " " + titulo).strip()
        seg = find_segmento(anchor_line) or find_segmento(" ".join(block))
        prop = None
        for cl in [anchor_line] + [b for b in block if b is not anchor_line]:
            for tk in [clean(t) for t in re.split(r"\s{2,}", cl) if clean(t)]:
                if tk in {"FAIXA", "SIM", "NÃO", "R$"} or re.search(r"R\$|FAIXA|\d,\d{4}|2026\d{7}|^\d+$", tk):
                    continue
                if find_segmento(tk):
                    continue
                if is_name_token(tk):
                    prop = tk
                    break
            if prop:
                break
        rows.append({"inscricao": insc, "titulo": clean(titulo)[:140], "segmento": seg,
                     "proponente": strip_cpf(prop) if prop else None, "nota": nota_m.group(1) if nota_m else None,
                     "autodeclaracoes": auto_m, "situacao": sit.title() if sit else None})
    return rows


# ---------------------------------------------------------------- FIDR 2026 (nomes Title Case)

DANCA_KEYWORDS = ("ESPET", "MOSTRA", "OFICINA", "WORKSHOP", "PROCESSO", "FORMA", "RESIDÊNCIA", "RESIDENCIA",
                  "SOLONo", "SOLO", "DUO", "TRIO", "CONVOCAT")


def _looks_name(t):
    words = t.split()
    if not (1 <= len(words) <= 6):
        return False
    if any(k in t.upper() for k in DANCA_KEYWORDS):
        return False
    if all(c.isupper() or c in "ÀÁÂÃÉÊÍÓÔÕÚÇ" for c in t if c.isalpha()):
        return len(words) >= 2  # nome em caixa alta
    return all(w[0].isupper() or w.lower() in {"de", "da", "do", "das", "dos", "e"} for w in words if w)


def parse_danca_full(path):
    lines = open(path, encoding="utf-8", errors="ignore").read().splitlines()
    rows = []
    i = 0
    while i < len(lines):
        m = re.match(r"^\s*(2026\d{7})\s+(.*)$", lines[i])
        if m:
            insc = m.group(1)
            block = m.group(2)
            j = i + 1
            while j < len(lines) and "HABILITADO" not in block.upper():
                block += " | " + lines[j]
                j += 1
            parts = [clean(p) for p in block.split("|") if clean(p)]
            titulo = parts[0] if parts else ""
            # proponente: nome Title Case acima e/ou abaixo da âncora (coluna do proponente),
            # juntando linhas consecutivas de nome quebrado
            prop = None
            above, below = [], []
            for jj in range(max(0, i - 4), i):
                t = clean(lines[jj])
                if not t or re.search(r"INSCRIÇÃO|TÍTULO|TIPO|PROPONENTE|SITUAÇÃO|ESPETÁCULO", t, re.I):
                    if above:
                        break
                    continue
                if _looks_name(t):
                    above.append(t)
                    if len(above) >= 3:
                        break
                elif above:
                    break
            for jj in range(i + 1, min(len(lines), i + 3)):
                t = clean(lines[jj])
                if not t or re.search(r"INSCRIÇÃO|TÍTULO|TIPO|PROPONENTE|SITUAÇÃO|ESPETÁCULO|2026\d{7}", t, re.I):
                    break
                if _looks_name(t):
                    below.append(t)
                else:
                    break
            if above or below:
                prop = " ".join(above + below)
            tipo = parts[1] if len(parts) > 1 else None
            rows.append({"inscricao": insc, "titulo": clean(titulo)[:120], "tipo": tipo,
                         "proponente": strip_cpf(prop) if prop else None, "situacao": "Habilitado",
                         "ordem": len(rows) + 1})
            i = j
        else:
            i += 1
    return rows


# ---------------------------------------------------------------- SIC 2023/2024 (FIC + MIC)

def parse_sic(path):
    lines = open(path, encoding="utf-8", errors="ignore").read().splitlines()
    aprov, inab = [], []
    programa = "FIC"
    inabilitado_mode = False
    for i, ln in enumerate(lines):
        up = clean(ln).upper()
        if re.search(r"FUNDO DE INCENTIVO À CULTURA\s*\(FIC\)", up):
            programa = "FIC"
            inabilitado_mode = "INABILITAD" in up
        elif re.search(r"MECENATO DE INCENTIVO À CULTURA\s*\(MIC\)", up):
            programa = "MIC"
            inabilitado_mode = "INABILITAD" in up
        m = re.match(r"^\s*(20\d{2}\d{7})\s+(.*)$", ln)
        m_mid = None
        if not m:
            mm = re.search(r"(20\d{2}\d{7})", ln)
            if mm and mm.start() > 5:
                m_mid = mm
        if not m and not m_mid:
            continue
        window = lines[max(0, i - 4):i + 5]
        win_text = clean(" ".join(window))
        seg = find_segmento(win_text)
        val_m = re.search(r"R\$\s*([\d.]+),(\d{2})", win_text)
        insc = (m.group(1) if m else m_mid.group(1))
        # proponente: linhas adjacentes à âncora (acima ou abaixo) com nome
        anchor_idx = i
        prop = None
        for jj in list(range(anchor_idx, max(0, anchor_idx - 4), -1)) + list(range(anchor_idx + 1, min(len(lines), anchor_idx + 4))):
            t = clean(lines[jj])
            if not t or t == clean(ln):
                continue
            if re.search(r"R\$|FAIXA|INABILITAD|APROVADOS|SEGMENTO|INSCRIÇÃO|PROJETO|PROPONENTE|VALOR", t):
                continue
            for tk in [clean(x) for x in re.split(r"\s{2,}", t) if clean(x)]:
                if find_segmento(tk):
                    continue
                if is_name_token(tk):
                    prop = tk if not prop else prop
            if prop:
                break
        # titulo
        titulo = ""
        if m:
            rest = m.group(2)
            toks = [clean(t) for t in re.split(r"\s{2,}", re.sub(r"R\$.*", "", rest)) if clean(t)]
            if toks:
                titulo = toks[0]
        if not titulo and m_mid:
            t = clean(ln)
            t = re.sub(r"^\s*[A-ZÀ-Ü\s/&-]{3,40}\s{2,}", "", t)
            t = re.sub(r"(20\d{2}\d{7})", "", t)
            titulo = clean(t)
        if not titulo:
            for jj in range(max(0, i - 2), i):
                t = clean(lines[jj])
                t2 = re.sub(r"^[A-ZÀ-Ü\s/&()-]{3,45}\s{2,}", "", t)
                if t2 and not find_segmento(t2) and not re.search(r"R\$", t2):
                    titulo = t2
                    break
        row = {"inscricao": insc, "titulo": clean(titulo)[:110],
               "proponente": strip_cpf(prop) if prop else None, "segmento": seg,
               "programa": programa}
        if inabilitado_mode:
            row["situacao"] = "Desclassificado"
            inab.append(row)
        elif val_m:
            row["situacao"] = "Selecionado"
            row["valor"] = float(val_m.group(1).replace(".", "")) + int(val_m.group(2)) / 100
            aprov.append(row)
    return aprov, inab




def parse_frevo(path):
    rows = []
    for line in open(path, encoding="utf-8", errors="ignore").read().splitlines():
        m = re.match(r"^\s*(\d+)\s+([A-ZÀ-Ü][^\n]{5,60}?)\s+(Selecionado|Selecionada|Habilitado|Habilitada)\s*$", line.strip())
        if m:
            rows.append({"ordem": int(m.group(1)), "proponente": clean(m.group(2)), "situacao": m.group(3)})
    return rows


def parse_fomento(path):
    """Solo/Aprendiz: título e proponente separados por coluna (layout preservado)."""
    rows = []
    lines = open(path, encoding="utf-8", errors="ignore").read().splitlines()
    for i, ln in enumerate(lines):
        m = re.match(r"\s*(2026\d{7})\s+(.*)$", ln)
        if not m:
            continue
        sit = None
        for jj in (i - 1, i, i + 1, i + 2):
            if 0 <= jj < len(lines):
                sit_m = re.search(r"(Selecionad[oa]|Habilitad[oa])", lines[jj])
                if sit_m:
                    sit = sit_m.group(1)
        if not sit:
            continue
        tit_parts, prop_parts = [], []
        for jj in list(range(max(0, i - 2), min(len(lines), i + 3))):
            t = lines[jj]
            t2 = re.sub(r"(Selecionad[oa]|Habilitad[oa])", " " * 12, t)
            tit = t2[20:58].strip() if len(t2) > 20 else ""
            prop = t2[58:105].strip() if len(t2) > 58 else ""
            if tit and not re.match(r"^\d+$", tit):
                tit_parts.append(tit)
            if prop and not re.match(r"^\d+$", prop):
                prop_parts.append(prop)
        def uniq(seq):
            out = []
            for x in seq:
                if x not in out:
                    out.append(x)
            return out
        rows.append({"inscricao": m.group(1), "titulo": clean(" ".join(uniq(tit_parts)))[:110],
                     "proponente": clean(" ".join(uniq(prop_parts)))[:90], "situacao": sit})
    return rows


if __name__ == "__main__":
    out = {}
    out["multilinguagens_final"] = parse_multilinguagens(f"{PDF_DIR}/multilinguagens_final.txt")
    out["virado2026"] = parse_multilinguagens(f"{PDF_DIR}/virado2026.txt")
    out["danca2026"] = parse_danca_full(f"{PDF_DIR}/danca2026.txt")
    ap23, in23 = parse_sic(f"{PDF_DIR}/sic2023.txt")
    apA, inA = parse_sic(f"{PDF_DIR}/sic2024_audio.txt")
    apE, inE = parse_sic(f"{PDF_DIR}/sic2024_exceto.txt")
    out["sic2023"] = {"aprovados": ap23, "inabilitados": in23}
    out["sic2024_audio"] = {"aprovados": apA, "inabilitados": inA}
    out["sic2024_exceto"] = {"aprovados": apE, "inabilitados": inE}
    out["solo2026_pool"] = parse_fomento(f"{PDF_DIR}/solo2026.txt")
    out["aprendiz2026_pool"] = parse_fomento(f"{PDF_DIR}/aprendiz2026.txt")
    out["frevo_pool"] = parse_frevo(f"{PDF_DIR}/frevo.txt")
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    mf = out["multilinguagens_final"]
    print("multilinguagens_final:", len(mf), Counter(r["situacao"] for r in mf))
    print("  proponente:", sum(1 for r in mf if r["proponente"]), "| segmento:", sum(1 for r in mf if r["segmento"]))
    print("virado2026:", len(out["virado2026"]), Counter(r["situacao"] for r in out["virado2026"]),
          "| proponente:", sum(1 for r in out["virado2026"] if r["proponente"]))
    dn = out["danca2026"]
    print("danca2026:", len(dn), "| proponente:", sum(1 for r in dn if r["proponente"]))
    for r in dn[:4]:
        print("   ", json.dumps(r, ensure_ascii=False)[:150])
    for k in ("sic2023", "sic2024_audio", "sic2024_exceto"):
        ap, ib = out[k]["aprovados"], out[k]["inabilitados"]
        segs = Counter((r["programa"], r["segmento"]) for r in ap)
        print(f"{k}: aprov={len(ap)} inab={len(ib)} prop={sum(1 for r in ap if r['proponente'])}/{len(ap)}")
        print("  ", dict(sorted(segs.items(), key=lambda x: str(x[0]))))
        for r in ap[:3]:
            print("   ", json.dumps(r, ensure_ascii=False)[:150])
