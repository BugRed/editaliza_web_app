# Captura dos 6 editais pendentes (2026-11-17)

O relatório da v3 deixou 6 editais de Olinda e Caruaru como "resultado pendente de captura". Esta pasta registra o que
foi tentado, com a conclusão de cada um. Nada aqui entrou em `data_v3/` nem muda os números do relatório.

| Edital | O que a fonte publica | Serve como ganhador travado? |
|---|---|---|
| Caruaru PNAB 001/2026 (Anastácio Rodrigues) | Lista final com 47 contemplados em 7 categorias, projeto, proponente, valor e classificação | **Sim.** Capturado em `caruaru_pnab2026_anastacio.json` (`capturar_caruaru_pnab2026.py`, com SHA-256 do PDF). |
| Caruaru PNAB 001/2024 (Caruaru Criativo) | Só o resultado da **análise documental** (habilitados), sem o mérito | Não: faltam os contemplados. |
| Caruaru São João 2025, Música | Listagem de **habilitados** (20 páginas), sem resultado de seleção | Não: ninguém é apontado como ganhador. |
| Caruaru São João 2025, Demais linguagens | Idem (11 páginas) | Não. |
| Olinda Premiação 001/2026 | A página lista os resultados em **pastas do Google Drive**, que não abrem sem navegador | Não por aqui: precisa de uma pessoa ou de um navegador. |
| Olinda Pontos de Cultura 004/2026 | Só o edital, sem resultado publicado | Não: o resultado ainda não saiu. |

## Limites do que foi capturado

- A lista de Caruaru **não traz candidatos que não ganharam**: só os 47 contemplados. Por isso ela entraria na métrica
  secundária (consistência entre aprovados), não no pool de ganhou × não ganhou.
- O PDF centraliza o texto das células, então o nome do projeto e o do proponente saem juntos em `texto_publicado`;
  separar os dois seria adivinhar. Os 47 registros batem com as 47 ocorrências de `HABILITADO/CONTEMPLADO` do PDF.
- Os CPF vêm mascarados pela própria prefeitura, e os CNPJ completos.
- Os portais de Caruaru responderam daqui (o relatório dizia que estavam inacessíveis). O de Olinda respondeu, mas os
  resultados ficam em Drive.
