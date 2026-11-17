# Marca "ponto final": logo, favicon e og-image

**Status:** em-desenvolvimento
**Responsabilidade:** ui
**Branch:** feature/ui-03/marca-ponto-final
**Autor:** BugRed · **Data:** 2026-11-16

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica
- [x] service — não se aplica
- [x] controller — não se aplica
- [x] route — `manifest.ts` e as convenções de arquivo de ícone e og-image em `src/app`
- [x] ui — `Logo`, `LogoMark` e `Wordmark` no menu, no login e no cadastro; fonte do nome
- [x] teste — arquivos da marca (dimensões, em curvas, manifest), `Logo` e `resolveSiteUrl`
- [x] doc — `docs/ui/marca.md`, CHANGELOG e dívida
<!-- /kit:camadas -->

**Próximo passo:** `/fechar` (gate, commits atômicos). Depois: conferir na Vercel o compartilhamento do link (Facebook
Sharing Debugger / LinkedIn Post Inspector), e começar o modo escuro, que vai religar as versões `-dark` da logo.

## Problema / motivação
O app usava o sol do protótipo, um ícone genérico, e não tinha favicon, ícone de celular nem imagem de
compartilhamento: o link no ar aparecia sem identidade. O usuário escolheu a proposta "Ponto final" entre seis
identidades tipográficas.

## Escopo
**Entra:**
- Símbolo e nome em curvas (SVG), favicon, ícone Apple, ícones do app, og-image e twitter-image, manifest.
- Marca no menu lateral, no cabeçalho de celular, no login e no cadastro, no lugar do sol.
- Metatags (título, descrição, Open Graph, Twitter, cor do tema) e endereço absoluto (`SITE_URL`).
- Scripts que regeneram os arquivos (`scripts/brand/`).

**Não entra (fora de escopo):**
- Modo escuro do app (próxima feature); as versões `-dark` da logo já existem mas não estão ligadas.
- og-image em versão escura; logo em curvas para o nome dentro do app (ele é texto vivo).

## Comportamento / fluxos
O navegador pega `favicon.ico` e `icon.svg` (este troca de cor com o tema do sistema); o iPhone pega `apple-icon.png`;
quem compartilha o link recebe `opengraph-image.png` com título e descrição. Os arquivos são públicos (o
middleware libera caminho com extensão), então o robô do compartilhamento os lê sem sessão.

## Impacto técnico
- **Banco:** nenhum.
- **API:** nenhuma. `manifest.ts` e as rotas de imagem são geradas pelo Next.
- **UI:** `src/app/components/brand/`, `src/app/layout.tsx`, `AppShell`, login e cadastro; `SITE_URL` em `env.ts`.

## Regras de negócio relacionadas
Nenhuma. Guia visual em [`docs/ui/marca.md`](../../ui/marca.md).

## Critérios de aceite

<!-- kit:criterios -->
- [x] Favicon, ícone Apple, ícones do app e og-image existem com as dimensões certas e são servidos sem login
- [x] A marca nova substitui o sol no menu, no login e no cadastro
- [x] Metatags de título, descrição, Open Graph e Twitter, com URL absoluta no domínio da Vercel
- [x] Nenhum SVG da marca depende de fonte (em curvas) e o manifest só aponta para ícones que existem
- [ ] Usuário confere o compartilhamento do link na Vercel e aprova a frase da og-image
<!-- /kit:criterios -->

## Dívida / não exercitado
- **Frase provisória:** "Editais culturais, em linguagem simples." foi minha sugestão na proposta; o usuário não a confirmou.
- **Decidido na hora:** título padrão `Editaliza: editais culturais, em linguagem simples` (o do protótipo era
  "Rede de Editais e Artistas"); descrição mantida a do protótipo; nome em texto vivo na interface e em curvas nos arquivos.
- **Não exercitado:** o compartilhamento real na Vercel; o app instalado no Android e no iPhone; o `metadataBase` num
  deploy de preview (aponta para o domínio de produção).
- **Legado com o sol:** `components/header/header.tsx` (só usado pela página `/teste`) e `(auth)/cadastro/loginForm.tsx`
  (sem uso) ainda importam o sol.
- O build precisa de rede para baixar a fonte Fraunces (`next/font`).

## Decisões em aberto
- Aprovar ou trocar a frase da og-image.
- og-image também em versão escura quando o modo escuro existir.
