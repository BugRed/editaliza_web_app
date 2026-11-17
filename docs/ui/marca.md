# Marca Editaliza

Decidida em 2026-11-16 entre seis propostas tipográficas: **"Ponto final"**. Feature: [`0003-marca-ponto-final`](../features/ui/0003-marca-ponto-final.md).

## A ideia

O nome escrito em minúsculas, **editaliza.**, com o ponto final em âmbar como assinatura (o edital que se
conclui). O símbolo é o "e" do nome, em branco sobre um quadrado teal de cantos arredondados, com o mesmo ponto
âmbar. Funciona como favicon porque o "e." se lê até em 16 px.

## Cores e letra

| Uso | Claro | Escuro |
|---|---|---|
| Fundo do símbolo e do nome | `#0E7C86` | `#3CC0CB` |
| Letra do símbolo | `#FFFFFF` | `#08202D` |
| Ponto (acento) | `#FFB800` | `#FFC933` |
| Nome em texto | `#0E7C86` | `#E8F5F6` |

Letra: **Fraunces**, peso 600, minúscula, com o corte óptico (`opsz`) acompanhando o tamanho. A frase
"Editais culturais, em linguagem simples." (og-image) é Roboto 400 e **ainda é provisória**.

## Arquivos

| Arquivo | Para quê |
|---|---|
| `public/brand/mark.svg`, `mark-dark.svg` | símbolo, em curvas |
| `public/brand/logo.svg`, `logo-dark.svg` | símbolo + nome, em curvas |
| `src/app/icon.svg` | ícone do navegador; troca de cor com o tema do sistema |
| `src/app/favicon.ico` | 16, 32 e 48 px, para navegadores antigos |
| `src/app/apple-icon.png` | 180 px, tela inicial do iPhone |
| `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` | app instalável (manifest) |
| `src/app/opengraph-image.png`, `twitter-image.png` | imagem de compartilhamento, 1200×630 |
| `src/app/manifest.ts` | nome, cores e ícones do app |
| `src/app/components/brand/Logo.tsx` | `LogoMark`, `Wordmark` e `Logo` para a interface |

Todos os SVGs estão **em curvas**: nenhum depende de fonte instalada (há teste para isso). Na interface o nome é
texto vivo em Fraunces (`next/font`), para o corte óptico acompanhar o tamanho.

## Como regenerar

Os arquivos acima saem de dois scripts em `scripts/brand/`:

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools uharfbuzz
# Baixe as fontes variáveis (OFL) do Google Fonts: Fraunces[SOFT,WONK,opsz,wght].ttf e Roboto[wdth,wght].ttf
.venv/bin/python scripts/brand/build-brand.py --fraunces <Fraunces.ttf> --roboto <Roboto.ttf>
node scripts/brand/rasterize.mjs        # favicon.ico, apple-icon, ícones do app e og-image
```

Mudar a frase, a cor ou o peso é editar `build-brand.py` e rodar os dois comandos. Os intermediários ficam em
`scripts/brand/.build/` (fora do git).

## Endereço público

Os links absolutos da og-image e dos ícones usam `SITE_URL`; sem ela vale o domínio de produção que a Vercel
define sozinha (`VERCEL_PROJECT_PRODUCTION_URL`); sem nenhum dos dois, `http://localhost:3000`.

## Uso

- Tamanho mínimo do símbolo: 16 px. Abaixo disso, só o ponto âmbar não se sustenta.
- O ponto é sempre âmbar e redondo; nunca colorir de teal nem trocar por outra figura.
- Fundo escuro: usar as versões `-dark`, não inverter as claras.
