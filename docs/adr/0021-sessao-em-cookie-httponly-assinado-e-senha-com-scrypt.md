# ADR 0021 — Sessão em cookie httpOnly assinado e senha com scrypt

**Status:** Aceito · 2026-11-16

## Contexto

O auth herdado (W0, ainda no protótipo) tinha quatro fraquezas conhecidas: senha em texto puro e
comparada por igualdade; token = base64 de `id-email-timestamp`, **sem assinatura** (qualquer um que
soubesse um e-mail fabricava a sessão dele); cookie legível por JavaScript; e o protótipo ainda
guardava o token em `localStorage`. O Better Auth (O2) vai substituir tudo, mas o app vai ao ar
antes disso e o usuário pediu que nada ficasse em `localStorage`.

## Decisão

1. **Cookie `httpOnly`, `SameSite=Lax`, `Secure` em HTTPS, 1 h.** O JavaScript da página nunca vê o
   token; nada em `localStorage`, `sessionStorage` nem `document.cookie`. O navegador envia o cookie
   sozinho; não existe `Authorization: Bearer`.
2. **O token vai só no cookie.** Login e cadastro não o devolvem no corpo. O logout é uma rota
   (`POST /api/auth/logout`), porque só o servidor apaga cookie `httpOnly`.
3. **Token assinado:** `base64url(payload).base64url(HMAC-SHA256)`, com `sub`, `email` e `exp`, usando
   Web Crypto (roda no edge, onde o middleware verifica). O segredo é `AUTH_SECRET` (32 caracteres ou
   mais, sem valor padrão); sem ele o sistema **falha fechado**.
4. **Senha com scrypt** (`node:crypto`, N=16384, salt de 16 bytes, comparação em tempo constante), em
   `db/password.mjs`, único arquivo usado pelo app e pelo seed. Senha em texto puro no banco **nunca
   confere**: banco antigo se recria (`yarn dev:db:reset`) em vez de o app aceitar texto puro.
5. A página `/login` e as demais exigem sessão válida no middleware; API sem sessão responde 401.

## Alternativas rejeitadas

- **Manter token em `localStorage` para uso em iframe:** exposição a XSS; o usuário vetou.
- **JWT com biblioteca:** dependência a mais para um formato que o Better Auth vai descartar.
- **bcrypt/argon2:** exigem dependência nativa; scrypt vem no Node e atende ao que é provisório.
- **Aceitar senha em texto puro e regravar como hash no primeiro login:** manteria o caminho inseguro
  no código para sempre; para dado de exemplo, recriar o banco é mais barato.

## Consequências

- ➕ Forjar sessão exige o `AUTH_SECRET`; XSS não rouba o token; vazar o banco não vaza senha legível.
- ➖ **Logout não revoga o token**: ele segue válido até vencer (1 h) para quem o copiou antes. Sem
  lista de revogação, de propósito (estado no servidor é coisa do Better Auth).
- ➖ Sem limite de tentativas de login (força bruta) e sem token CSRF (só `SameSite=Lax`).
- ➖ Trocar o `AUTH_SECRET` derruba todas as sessões.
- ⚠️ O app não funciona em iframe com cookie de terceiro bloqueado (o protótipo contornava com
  `localStorage`). Sinal para rever: a necessidade de embutir o app em outro site.
