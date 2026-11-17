// Token de sessão assinado: `base64url(payload).base64url(HMAC-SHA256)`. Módulo puro, só Web Crypto:
// o middleware (edge) e as rotas de API (node) importam o mesmo código. O segredo entra por parâmetro,
// porque cada runtime lê a env do seu jeito. Better Auth (T1.2) substitui este formato.

export interface SessaoToken {
  userId: string;
  email: string;
}

export const SESSION_TTL_SECONDS = 60 * 60;
const MIN_SECRET_LENGTH = 32;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array | null {
  try {
    const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function hasUsableSecret(secret: string | undefined): secret is string {
  return typeof secret === 'string' && secret.length >= MIN_SECRET_LENGTH;
}

function importKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);
}

export async function createSessionToken(
  userId: string | number,
  email: string,
  secret: string | undefined,
  nowMs: number = Date.now()
): Promise<string> {
  if (!hasUsableSecret(secret)) throw new Error('AUTH_SECRET ausente ou curto demais para assinar a sessão.');
  const payload = { sub: String(userId), email, exp: Math.floor(nowMs / 1000) + SESSION_TTL_SECONDS };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', await importKey(secret, 'sign'), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Devolve a sessão só se a assinatura confere e o prazo não venceu; qualquer outra coisa é null. */
export async function readSessionToken(
  token: string | undefined | null,
  secret: string | undefined,
  nowMs: number = Date.now()
): Promise<SessaoToken | null> {
  if (!token || !hasUsableSecret(secret)) return null;
  const [body, signature, ...extra] = token.split('.');
  if (!body || !signature || extra.length > 0) return null;

  const signatureBytes = fromBase64Url(signature);
  if (!signatureBytes) return null;
  const valid = await crypto.subtle.verify('HMAC', await importKey(secret, 'verify'), signatureBytes as BufferSource, encoder.encode(body));
  if (!valid) return null;

  const payloadBytes = fromBase64Url(body);
  if (!payloadBytes) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as { sub?: unknown; email?: unknown; exp?: unknown };
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string' || typeof payload.exp !== 'number') return null;
    if (nowMs / 1000 >= payload.exp) return null;
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
