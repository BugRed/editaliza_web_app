# -*- coding: utf-8 -*-
"""Remove a duplicação da primeira entrada do TOC e injeta número de página em cache."""
import re
import shutil
import zipfile

src = "/home/z/my-project/download/ArtistRank_avaliacao_empirica_decisoes.docx"
tmp = "/tmp/artistrank_toc_fix.docx"

zin = zipfile.ZipFile(src, "r")
x = zin.read("word/document.xml").decode("utf-8")

# 1) injeta número em cache no PAGEREF da primeira entrada (entre separate e end)
pat = re.compile(
    r'(<w:hyperlink w:history="1" w:anchor="_Toc1">.*?PAGEREF _Toc1 \\h</w:instrText>'
    r'<w:fldChar w:fldCharType="separate"/>)(<w:fldChar w:fldCharType="end"/>)', re.S)
x2, n1 = pat.subn(r'\1<w:r><w:t>1</w:t></w:r>\2', x)
assert n1 == 1, f"PAGEREF _Toc1 nao encontrado ({n1})"

# 2) remove o parágrafo duplicado em texto simples ("1. Contexto e objetivo" + 1)
dup = re.compile(
    r'<w:p><w:pPr><w:pStyle w:val="TOC1"/><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9026"/></w:tabs>'
    r'<w:spacing w:before="120" w:after="60"/></w:pPr><w:r><w:t>1\. Contexto e objetivo</w:t></w:r>'
    r'<w:r><w:tab/></w:r><w:r><w:t>1</w:t></w:r></w:p>', re.S)
x2, n2 = dup.subn("", x2)
assert n2 == 1, f"paragrafo duplicado nao encontrado ({n2})"

zout = zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data = zin.read(item.filename)
    if item.filename == "word/document.xml":
        data = x2.encode("utf-8")
    zout.writestr(item, data)
zout.close()
zin.close()
shutil.move(tmp, src)
print("TOC corrigido: cache de pagina injetado, duplicata removida")
