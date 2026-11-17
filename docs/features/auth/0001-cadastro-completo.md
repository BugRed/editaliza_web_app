# Cadastro completo: foto, senha forte, CPF e linguagens

**Status:** em-desenvolvimento
**Responsabilidade:** auth
**Branch:** feature/auth-02/cadastro-completo (empilhada sobre `feature/ui-03/marca-ponto-final`)
**Autor:** BugRed · **Data:** 2026-11-16

> Esta spec é também o **estado** da feature. O que o git sabe (commits, arquivos,
> camadas tocadas) é calculado pelo hook e não se escreve aqui. O que mora aqui é o
> que nenhum commit guarda: intenção, próximo passo e dívida.

## Estado

<!-- kit:camadas -->
- [x] prisma — não se aplica
- [x] service — `auth-service` devolve a foto no resumo do usuário; `buildFallbackProfile` em `user-profiles.ts`
- [x] controller — não se aplica
- [x] route — `POST /api/auth/register`: senha forte, CPF válido, foto obrigatória
- [x] ui — página de cadastro, `AvatarPicker`, `PasswordChecklist`, store social
- [x] teste — regras (CPF, CNPJ, senha, foto), rotas, componentes e a página de cadastro; fluxo ponta a ponta no navegador
- [x] doc — CHANGELOG e dívida
<!-- /kit:camadas -->

**Próximo passo:** o usuário confere o cadastro no navegador e na Vercel (mock) e decide quando ligar `PHOTO_STORAGE=supabase`
(criar o bucket `avatars` público e as variáveis, ver `docs/ops/ambiente.md`); depois push e PR (do usuário). Em seguida,
troca e recuperação de senha, e a escolha do banco de verdade, que é o que faz a conta nova durar na Vercel.

## Problema / motivação
O cadastro aceitava senha de 6 caracteres, CPF sem máscara nem validação, só 8 linguagens e nenhuma foto, e quem se
cadastrava via o perfil do João: a store social carregava os perfis uma vez só e, sem achar a pessoa nova, caía no
primeiro da lista. A regressão veio de eu ter tirado o token da store ao remover o `localStorage`.

## Escopo
**Entra:**
- Máscara de CPF e de CNPJ enquanto digita; CPF opcional, mas, se informado, com dígitos verificadores corretos.
- Senha forte (8+ caracteres, maiúscula, minúscula, número e símbolo) no formulário (lista ao vivo) e no servidor.
- Foto obrigatória (artista) ou logo opcional (instituição): recortada em quadrado e reduzida a 320×320 JPEG no navegador, enviada como data URL
  e revalidada no servidor (JPEG/PNG/WebP, nunca SVG, até ~110 KB). Guardada no registro (`inline`) ou no Supabase Storage
  (`PHOTO_STORAGE=supabase`, [ADR 0022](../../adr/0022-fotos-de-perfil-no-supabase-storage-com-fallback-no-registro.md)).
- Mais linguagens (7 grupos, ~40 opções) e campo para uma linguagem própria.
- Conta nova passa a ver o próprio perfil (recarga ao mudar o usuário e perfil mínimo no lugar de "o primeiro da lista").

**Não entra (fora de escopo):**
- Troca de senha, recuperação de senha e confirmação de e-mail.
- Armazenamento real de imagens (CDN), recorte manual pelo usuário e moderação de foto.
- Aplicar a política de senha às contas que já existem.

## Comportamento / fluxos
Cadastrar → o servidor valida tudo de novo (mensagem por campo) → grava o hash da senha, a foto e o perfil → abre a sessão
(cookie httpOnly) → a store carrega os perfis e mostra o da própria pessoa. Entrar depois funciona com a mesma senha.

## Impacto técnico
- **Banco:** nenhuma coluna nova; `imgUrl` e `avatarUrl` passam a guardar o data URL da foto.
- **API:** `register` recusa (400) senha fraca, CPF inválido, foto ausente/inválida/grande e linguagem com mais de 40 caracteres.
- **UI:** `src/app/(auth)/cadastro/page.tsx`, `components/forms/`, `hooks/useSocialStore.tsx`, `lib/image-upload.ts`.

## Regras de negócio relacionadas
Nenhuma regra de domínio nova: são regras de entrada de dados. A lista de linguagens segue sendo comparada por nome no ranking.

## Critérios de aceite

<!-- kit:criterios -->
- [x] CPF e CNPJ com máscara enquanto digita; CPF com dígito errado é recusado
- [x] Senha sem maiúscula, minúscula, número ou símbolo é recusada no formulário e no servidor
- [x] Artista sem foto, ou com foto inválida (SVG, endereço remoto, grande demais), não cadastra; empresa cadastra sem logo
- [x] Com `PHOTO_STORAGE=supabase` o arquivo vai ao Storage e o perfil guarda só o endereço; falha do Storage responde 502 e não cria a conta
- [x] Linguagens: mais opções, agrupadas, com campo para outra
- [x] Quem se cadastra entra e vê o próprio perfil (nome, foto, linguagens), nunca o de outra pessoa; consegue entrar de novo com a senha
- [ ] Usuário confere o cadastro no navegador e na Vercel (mock)
<!-- /kit:criterios -->

## Dívida / não exercitado
- **Mock na Vercel:** o cadastro é gravado em memória da instância; depois de um cold start (ou numa outra instância) a conta some e
  não dá para entrar de novo. É o limite já registrado do mock, e agora mais visível.
- **Foto no banco como texto** (~1 a 110 KB por linha) enquanto `PHOTO_STORAGE=inline`. O envio ao Supabase Storage foi testado com `fetch`
  simulado, **não** contra um Storage real, e exige criar o bucket e as variáveis na Vercel.
- **Decidido na hora:** CPF validado pelos dígitos verificadores (CPFs inventados como 111.111.111-11 são recusados); máscara também no
  CNPJ, que não foi pedida; linguagem própria entra como linguagem principal e só casa com editais de mesmo nome; foto obrigatória
  também para instituições (revisto: agora opcional para elas).
- **Contas antigas** (seed) têm senha que não cumpre a política; ela vale só no cadastro.
- Não exercitado: celular (envio de foto pela câmera) e fotos HEIC do iPhone, que o navegador pode não abrir.

## Decisões em aberto
- Quando ligar `PHOTO_STORAGE=supabase` na Vercel (depende de criar o bucket e a chave de serviço).
