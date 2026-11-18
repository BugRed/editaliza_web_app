# -*- coding: utf-8 -*-
"""Pós-processamento do docx: patch de footer (ROMAN/arabic) e remoção de pgNumType vazio."""
import re
import shutil
import sys
import zipfile

src = "/home/z/my-project/download/ArtistRank_avaliacao_empirica_decisoes.docx"
tmp = "/tmp/artistrank_report_patch.docx"

zin = zipfile.ZipFile(src, "r")
names = zin.namelist()
footers = sorted(n for n in names if re.match(r"word/footer\d+\.xml", n))

# Identificar a qual seção cada footer pertence via document.xml (ordem de referência)
docxml = zin.read("word/document.xml").decode("utf-8")
# Remover pgNumType vazio (emite confusão no WPS)
docxml_patched = docxml.replace("<w:pgNumType/>", "")

# Seções na ordem: capa (sem footer), sumário (ROMAN), corpo (arabic).
# footer1/footer2...: docx-js cria um footer por seção com footer definido;
# a seção 2 (ROMAN) referencia o primeiro footer e a seção 3 o segundo.
footer_fmt = {}
refs = re.findall(r'<w:footerReference[^>]*r:id="(rId\d+)"[^>]*/>', docxml_patched)
rels = zin.read("word/_rels/document.xml.rels").decode("utf-8")
rid_to_file = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="(footer\d+\.xml)"', rels))
ordered = [rid_to_file[r] for r in refs if r in rid_to_file]
if len(ordered) >= 2:
    footer_fmt[ordered[0]] = "ROMAN"
    for f in ordered[1:]:
        footer_fmt[f] = "arabic"
else:
    # fallback: patch tudo como arabic
    for f in footers:
        footer_fmt[f.replace("word/", "")] = "arabic"

zout = zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data = zin.read(item.filename)
    if item.filename == "word/document.xml":
        data = docxml_patched.encode("utf-8")
    else:
        base = item.filename.replace("word/", "")
        if base in footer_fmt:
            x = data.decode("utf-8")
            fmt = footer_fmt[base]
            x = re.sub(r'(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)',
                       r'\1 PAGE \\* ' + fmt + r' \\* MERGEFORMAT \2', x)
            data = x.encode("utf-8")
    zout.writestr(item, data)
zout.close()
zin.close()
shutil.move(tmp, src)
print("patched footers:", footer_fmt, "| pgNumType vazio removido:", "<w:pgNumType/>" not in docxml_patched)
