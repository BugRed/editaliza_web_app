# -*- coding: utf-8 -*-
"""Extração assistida: blocos por inscrição nos SIC (2023/2024), top-2 por valor por segmento."""
import re

TXT = "/tmp/bench_txt"
SEG = ["ARTESANATO", "CULTURA POPULAR", "MÚSICA", "MUSICA", "TEATRO", "DANÇA", "DANCA", "LITERATURA", "ARTES VISUAIS", "CIRCO", "AUDIOVISUAL", "ARTES CULTURAIS INTEGRADAS E ARTE E TECNOLOGIA", "ARTES INTEGRADAS", "PATRIMÔNIO", "GASTRONOMIA", "FOTOGRAFIA", "ARTES CULTURAIS", "MODA"]


def blocks(path):
    lines = open(path, encoding="utf-8", errors="ignore").read().splitlines()
    cur = None
    out = []
    for ln in lines:
        s = ln.rstrip()
        m = re.match(r"^\s*(\d{8,14})\s+(.*)$", s)
        if m:
            if cur:
                out.append(cur)
            cur = {"insc": m.group(1), "text": m.group(2)}
        elif cur and s.strip() and not re.match(r"^\s*(INSCRI|PROJETO|PROPONENTE|SEGMENTO|VALOR|FUNDO|MECENATO|EDICAO|EDITAL|SECRET|FUNDA|SISTEMA)", s.strip(), re.I):
            cur["text"] += " " + s.strip()
        elif s.strip() == "":
            pass
    if cur:
        out.append(cur)
    return out


def detect_seg(text):
    up = text.upper()
    for cand in ["ARTES CULTURAIS INTEGRADAS", "ARTESANATO", "CULTURA POPULAR", "MÚSICA", "MUSICA", "TEATRO", "DANÇA", "DANCA", "LITERATURA", "ARTES VISUAIS", "CIRCO", "AUDIOVISUAL", "PATRIMÔNIO", "GASTRONOMIA", "FOTOGRAFIA", "MODA"]:
        if cand in up:
            return cand
    return None


def run(path, label, top=4):
    print(f"\n########## {label} ##########")
    by_seg = {}
    for b in blocks(path):
        m = re.search(r"R\$\s*([\d.]+),(\d{2})", b["text"])
        if not m:
            continue
        val = float(m.group(1).replace(".", "")) + int(m.group(2)) / 100
        seg = detect_seg(b["text"])
        mid = b["text"][: m.start()]
        mid = re.sub(r"\s+", " ", mid).strip()
        by_seg.setdefault(seg, []).append({"insc": b["insc"], "val": val, "mid": mid[:150]})
    for seg, rows in sorted(by_seg.items(), key=lambda kv: -len(kv[1])):
        rows.sort(key=lambda r: -r["val"])
        print(f"\n--- SEGMENTO {seg} ({len(rows)} aprovados) — maiores valores:")
        for r in rows[:top]:
            print(f"   R$ {r['val']:>9.2f} | {r['insc']} | {r['mid']}")


run(f"{TXT}/sic2023.txt", "SIC 2023 FIC/MIC")
run(f"{TXT}/sic2024_audiovisual.txt", "SIC 2024 AUDIOVISUAL")
run(f"{TXT}/sic2024_excetoaudio.txt", "SIC 2024 EXCETO AUDIOVISUAL")
