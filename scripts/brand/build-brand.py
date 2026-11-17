#!/usr/bin/env python3
"""Gera os SVGs da marca Editaliza com as letras em curvas (nenhum arquivo depende de fonte).

Uso:  python3 scripts/brand/build-brand.py --fraunces <Fraunces.ttf> --roboto <Roboto.ttf>
Depende de: fonttools e uharfbuzz (pip install fonttools uharfbuzz).
Saída: public/brand/*.svg, src/app/icon.svg e intermediários em scripts/brand/.build/ (para rasterize.mjs).
As fontes são variáveis do Google Fonts (OFL): Fraunces (símbolo e nome) e Roboto (frase da og-image).
"""
import argparse
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parents[2]
TEAL, TEAL_DEEP, AMBER, INK, MUTED, PAPER = "#0E7C86", "#09585F", "#FFB800", "#102A30", "#4A656B", "#F8FAFB"
DARK_TEAL, DARK_AMBER, DARK_INK, DARK_TEXT = "#3CC0CB", "#FFC933", "#08202D", "#E8F5F6"


def load_font(path, variations):
    face = hb.Face(hb.Blob.from_file_path(str(path)))
    font = hb.Font(face)
    font.set_variations(variations)
    return font, face.upem


def shape(font, upem, text, size, x, y, tracking=0.0):
    """Devolve (path_por_cluster, largura): o contorno de cada glifo, em coordenadas SVG, já posicionado."""
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    scale = size / upem
    cursor = 0.0
    paths = {}
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        pen = SVGPathPen(None)
        tx = x + (cursor + pos.x_offset) * scale
        ty = y - pos.y_offset * scale
        font.draw_glyph_with_pen(info.codepoint, TransformPen(pen, (scale, 0, 0, -scale, tx, ty)))
        paths[info.cluster] = paths.get(info.cluster, "") + pen.getCommands()
        cursor += pos.x_advance + tracking * upem
    return paths, cursor * scale


def f(n):
    return f"{n:.2f}".rstrip("0").rstrip(".")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fraunces", required=True)
    ap.add_argument("--roboto", required=True)
    args = ap.parse_args()

    out_public = ROOT / "public" / "brand"
    out_build = ROOT / "scripts" / "brand" / ".build"
    for d in (out_public, out_build):
        d.mkdir(parents=True, exist_ok=True)

    # ── Símbolo: "e" em serifa e o ponto final âmbar, num quadrado de cantos arredondados (caixa 64×64) ──
    fr_mark, upem = load_font(args.fraunces, {"wght": 600, "opsz": 46, "SOFT": 0, "WONK": 0})
    _, width = shape(fr_mark, upem, "e", 46, 0, 0)
    e_paths, _ = shape(fr_mark, upem, "e", 46, 27 - width / 2, 45)
    e_d = "".join(e_paths.values())
    DOT = (46, 42.5, 4.6)

    def mark_body(bg, glyph, accent):
        return (f'<rect x="5" y="5" width="54" height="54" rx="13" fill="{bg}"/>'
                f'<path d="{e_d}" fill="{glyph}"/>'
                f'<circle cx="{DOT[0]}" cy="{DOT[1]}" r="{DOT[2]}" fill="{accent}"/>')

    def svg(vb, body, title):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{title}">'
                f'<title>{title}</title>{body}</svg>\n')

    (out_public / "mark.svg").write_text(svg("0 0 64 64", mark_body(TEAL, "#FFFFFF", AMBER), "Editaliza"))
    (out_public / "mark-dark.svg").write_text(svg("0 0 64 64", mark_body(DARK_TEAL, DARK_INK, DARK_AMBER), "Editaliza"))

    # Ícone do navegador: um só arquivo que troca de cor conforme o tema do sistema.
    icon = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
            '<style>.b{fill:#0E7C86}.g{fill:#fff}.a{fill:#FFB800}'
            '@media (prefers-color-scheme:dark){.b{fill:#3CC0CB}.g{fill:#08202D}.a{fill:#FFC933}}</style>'
            f'<rect class="b" x="5" y="5" width="54" height="54" rx="13"/>'
            f'<path class="g" d="{e_d}"/>'
            f'<circle class="a" cx="{DOT[0]}" cy="{DOT[1]}" r="{DOT[2]}"/></svg>\n')
    (ROOT / "src" / "app" / "icon.svg").write_text(icon)

    # ── Logo horizontal: símbolo + nome "editaliza." (o ponto em âmbar) ──
    fr_word, upem_w = load_font(args.fraunces, {"wght": 600, "opsz": 36, "SOFT": 0, "WONK": 0})
    word_paths, word_w = shape(fr_word, upem_w, "editaliza.", 44, 76, 44, tracking=-0.02)
    main_d = "".join(d for c, d in word_paths.items() if c < 9)
    dot_d = "".join(d for c, d in word_paths.items() if c >= 9)
    lw = 76 + word_w + 4

    def logo(bg, glyph, accent, text):
        return svg(f"0 0 {f(lw)} 64", mark_body(bg, glyph, accent) + f'<path d="{main_d}" fill="{text}"/><path d="{dot_d}" fill="{accent}"/>', "Editaliza")

    (out_public / "logo.svg").write_text(logo(TEAL, "#FFFFFF", AMBER, TEAL))
    (out_public / "logo-dark.svg").write_text(logo(DARK_TEAL, DARK_INK, DARK_AMBER, DARK_TEXT))

    # ── Intermediários para rasterizar (apple-icon, ícones do celular e og-image) ──
    def full_bleed(size, fraction):
        k = size * fraction / 38  # a composição "e." tem ~38 unidades de largura na caixa de 64
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}"><rect width="{size}" height="{size}" fill="{TEAL}"/>'
                f'<g transform="translate({size/2} {size/2}) scale({f(k)}) translate(-32 -35.5)">'
                f'<path d="{e_d}" fill="#FFFFFF"/><circle cx="{DOT[0]}" cy="{DOT[1]}" r="{DOT[2]}" fill="{AMBER}"/></g></svg>\n')

    (out_build / "apple-icon.svg").write_text(full_bleed(180, 0.64))
    (out_build / "maskable.svg").write_text(full_bleed(512, 0.52))

    fr_og, upem_o = load_font(args.fraunces, {"wght": 600, "opsz": 72, "SOFT": 0, "WONK": 0})
    og_paths, _ = shape(fr_og, upem_o, "editaliza.", 160, 478, 344, tracking=-0.02)
    og_main = "".join(d for c, d in og_paths.items() if c < 9)
    og_dot = "".join(d for c, d in og_paths.items() if c >= 9)
    rb, upem_r = load_font(args.roboto, {"wght": 400, "wdth": 100})
    t1, _ = shape(rb, upem_r, "Editais culturais,", 38, 482, 414)
    t2, _ = shape(rb, upem_r, "em linguagem simples.", 38, 482, 462)
    og = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="{PAPER}"/>'
          f'<rect x="0" y="0" width="1200" height="14" fill="{TEAL}"/>'
          f'<g transform="translate(112 171) scale(4.5)">{mark_body(TEAL, "#FFFFFF", AMBER)}</g>'
          f'<path d="{og_main}" fill="{TEAL}"/><path d="{og_dot}" fill="{AMBER}"/>'
          f'<path d="{"".join(t1.values())}{"".join(t2.values())}" fill="{MUTED}"/></svg>\n')
    (out_build / "og.svg").write_text(og)
    print("ok: marca gerada")


if __name__ == "__main__":
    main()
