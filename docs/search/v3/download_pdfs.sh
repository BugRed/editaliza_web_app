#!/bin/bash
# Re-download dos PDFs de resultado (v2) para o diretorio persistente da v3
mkdir -p /home/z/my-project/scripts/artistrank_v3/pdf
cd /home/z/my-project/scripts/artistrank_v3/pdf
declare -A URLS=(
[multilinguagens_final]="https://www.culturarecife.com.br/public/documentos/resultado_home_13_multilinguagem_recife_criativo_pnab_2026/Multilinguagem_Recife_Criativo_PNAB_Resultado_FINAL.pdf"
[multilinguagens_prelim]="https://www.culturarecife.com.br/public/documentos/resultado_home_13_multilinguagem_recife_criativo_pnab_2026/Multilinguagem_Recife_Criativo_PNAB_Resultado_Preliminar.pdf"
[multilinguagens_doc]="https://www.culturarecife.com.br/public/documentos/resultado_home_13_multilinguagem_recife_criativo_pnab_2026/Resultado%20Final%20da%20An%C3%A1lise%20Documental%20-%20MULTILINGUAGENS%202026.pdf"
[danca2026]="https://www.culturarecife.com.br/public/documentos/resultado_home_7_resultados_da_29a_festival_internacional_de_danca_do_recife_2026/Resultado%20Final%20da%20Convocat%C3%B3ria%20do%2029o%20Festival%20Internacional%20de%20Dan%C3%A7a%20do%20Recife%20-2026.pdf"
[circo2026]="https://www.culturarecife.com.br/public/documentos/resultado_home_5_resultados_da_15a_mostra_de_circo_do_recife_2026/Resultado%20Final%20dos%20Habilitados%20da%20Convocat%C3%B3ria%20da%2015o%20Mostra%20de%20Circo%20do%20Recife%202026.pdf"
[circo2025]="https://www.culturarecife.com.br/public/documentos/resultado_home_22_convocatoria_da_14a_mostra_de_circo_do_recife_2025/Resultado%20Pos-Recurso%20da%2014%20Mostra%20de%20Circo%20do%20Recife%20-%202025.pdf"
[letra2025]="https://www.culturarecife.com.br/public/documentos/resultado_home_24_resultados_22_festival_recifense_de_literatura_a_letra_e_a_voz_2025/Resultado-Preliminar-da-Convocatoria-do-22-Festival-Recifense-de-Literatura-A-Letra-e-a-Voz-2025.pdf"
[carnaval2026]="https://www.culturarecife.com.br/public/documentos/resultado_home_16_resultado_ciclo_carnavalesco_2026/CICLO%20CARNAVALESCO%202026_Resultado%20Preliminar.pdf"
[sic2024_audio]="https://www.culturarecife.com.br/public/documentos/resultado_home_28_editais_do_sic_2024_fic_e_mic/Aprovados%20na%203a%20fase%20-%20AUDIOVISUAL.pdf"
[sic2024_exceto]="https://www.culturarecife.com.br/public/documentos/resultado_home_28_editais_do_sic_2024_fic_e_mic/PROJETOS-APROVADOS-E-INABILITADOS-APOS-3-FASE-EXCETO-AUDIOVISUAL-RESULTADO-FINAL-SIC-2024-FIC-E-MIC.pdf"
[sic2023]="https://www.culturarecife.com.br/public/documentos/resultado_home_44_edital_sic_2023_fic_mic/PROJETOS%20APROVADOS%20%28APOS%203%C2%AAFASE%29%20-%20RESULTADO%20FINAL%20-%20SIC%202023%20%28FIC%20E%20MIC%29.pdf"
[virado2026]="https://www.culturarecife.com.br/public/documentos/resultado_home_11_recife_virado_na_periferia_pnab_2026/Virado_Periferia_HipHop_PNAB_Resultado_Preliminar.pdf"
[virado2024]="https://www.culturarecife.com.br/public/documentos/resultado_home_39_resultados_do_edital_recife_virado_na_periferia_pnab_2024/GERAL_VIRADO_NA_PERIFERIA%20-%20RESULTADO%20PRELIMINAR.pdf"
[frevo]="https://www.culturarecife.com.br/public/documentos/resultado_home_8_resultados_edital_interno_bolsas_escola_de_frevo/Resultado%20Final%20dos%20Habilitados%20e%20Selecionados%20do%20Edital%20Interno%20de%20Bolsas%20-%20Escola%20de%20Frevo.pdf"
[solo2026]="https://www.culturarecife.com.br/public/documentos/resultado_home_2_resultado_edital_de_fomento_o_solo_do_outro_2026/Resultado%20Preliminar%20dos%20Projetos%20Habilitados%20do%20Edital%20O%20Solo%20do%20Outro%202026.pdf"
[aprendiz2026]="https://www.culturarecife.com.br/public/documentos/resultado_home_3_resultados_edital_de_fomento_o_aprendiz_em_cena_2026/Resultado%20Preliminar%20dos%20Projetos%20Habilitados%20do%20Edital%20O%20Aprendiz%20em%20Cena%202026.pdf"
[fic2025_edital]="https://www.culturarecife.com.br/public/documentos/edital_fic_2025/EDITAL_FUNDO%20DE%20INCENTIVO%20-%20FIC_SIC%202025_retifica%C3%A7%C3%A3o%2028-04-26.pdf"
[sic2024_suplentes]="https://www.culturarecife.com.br/public/documentos/edital_home_35_mecenato_de_incentivo_a_cultura_2024/PROJETOS-SUPLENTES-APROVADOS-APOS-3-FASE-E-PROJETOS-AUDIOVISUAL-HABILITADOS-2-FASE%20APOS-RECURSOS-SIC-2024-FIC-E-MIC.pdf"
)
for k in "${!URLS[@]}"; do
  if [ -s "$k.pdf" ]; then echo "$k: ja existe"; continue; fi
  code=$(curl -s -L --max-time 60 -w "%{http_code}" -o "$k.pdf" "${URLS[$k]}")
  echo "$k: $code $(stat -c%s "$k.pdf" 2>/dev/null)"
done
for f in *.pdf; do [ -s "$f" ] && pdftotext -layout "$f" "${f%.pdf}.txt" 2>/dev/null && echo "txt: ${f%.pdf}.txt $(wc -l < ${f%.pdf}.txt) linhas"; done
