<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Convenções

As convenções deste repositório estão em [`CLAUDE.md`](./CLAUDE.md) — fonte única, para
qualquer agente. Este arquivo existe para as ferramentas que leem `AGENTS.md` e para o bloco
gerenciado acima, que o codemod do Next reescreve.

No Claude Code, o detalhe por camada mora nas skills `camada-ui`, `camada-db` e `next16`,
carregadas só quando a sessão toca aquela camada.
