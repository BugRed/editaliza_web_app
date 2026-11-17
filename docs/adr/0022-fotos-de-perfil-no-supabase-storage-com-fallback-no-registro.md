# ADR 0022 — Fotos de perfil no Supabase Storage, com fallback no registro

**Status:** Aceito · 2026-11-16

## Contexto

O cadastro passou a pedir foto (obrigatória para artista, opcional para empresa). Sem armazenamento de arquivos,
a primeira versão guardava a imagem (320×320 JPEG, até ~110 KB) como data URL dentro do próprio registro. O usuário
decidiu usar o **Supabase Storage** para as fotos. Mas o app hoje roda em mock na Vercel e em Docker no local
([ADR 0020](0020-fonte-de-dados-por-env-mock-em-producao-docker-no-local.md)), e nenhum dos dois tem Storage.

## Decisão

1. A env `PHOTO_STORAGE` escolhe onde a foto fica: `supabase` (arquivo num bucket do Supabase Storage, e o registro guarda só o
   endereço público) ou `inline` (padrão: a imagem pequena vai no registro). É **independente** de `DATA_SOURCE`: dá para ter
   dados em mock e fotos no Storage.
2. O navegador continua recortando e reduzindo a foto; o servidor revalida (JPEG, PNG ou WebP, nunca SVG, até ~110 KB) e só então
   envia. O envio é feito **pelo servidor**, com a chave de serviço (`SUPABASE_SERVICE_ROLE_KEY`, segredo, nunca no navegador),
   para o navegador não precisar de permissão de escrita no bucket.
3. O bucket (`SUPABASE_STORAGE_BUCKET`, padrão `avatars`) é **público**: foto de perfil é pública no produto. Cada envio gera um
   caminho novo (`u<id>-<8 caracteres>.<ext>`), para a troca de foto não ficar presa em cache.
4. O arquivo é enviado **antes** de criar a conta. Se o Storage falha, o cadastro responde 502 e nada é gravado.
5. `PHOTO_STORAGE=supabase` exige `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`; sem elas o app não sobe.
6. Empresa sem logo usa uma imagem padrão (`/images/…`) e não toca no Storage.

## Alternativas rejeitadas

- **Só data URL no banco:** engorda cada linha em até 110 KB, atrapalha as listagens e não permite cache nem CDN.
- **Upload direto do navegador ao Storage:** exigiria política de escrita aberta no bucket (qualquer um enviaria arquivo) ou URL assinada,
  e o cadastro acontece antes de existir conta; o envio pelo servidor é mais simples e fechado.
- **Vercel Blob ou S3:** o usuário escolheu o Supabase, que já será o banco.
- **Padrão `supabase` já agora:** quebraria o Docker local e o mock, que não têm Storage.

## Consequências

- ➕ A foto sai do banco, ganha URL pública, cache e CDN do Supabase, e a coluna passa a guardar texto curto.
- ➕ Dev local e demonstração seguem funcionando sem Storage.
- ➖ Duas formas de guardar a mesma coisa (`inline` e `supabase`) para manter; os testes cobrem as duas.
- ➖ Fotos antigas (data URL) e novas (endereço) convivem; as telas usam `<img>` e servem aos dois.
- ➖ A foto enviada não é apagada se a conta for removida (não há remoção de conta ainda).
- ⚠️ A chave de serviço dá acesso total ao projeto Supabase: só no servidor e só como env da Vercel. Sinal para rever: qualquer
  necessidade de enviar arquivo pelo navegador, ou de moderar imagens antes de publicar.
