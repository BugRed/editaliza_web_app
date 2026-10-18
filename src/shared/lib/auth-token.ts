// Token de sessão do W0: base64 de "userId-email-timestamp", válido por 1h.
// Módulo puro, sem env nem client — o middleware (edge) e as rotas de API
// (node) importam o mesmo código. Better Auth (T1.2) substitui este formato.

export interface SessaoToken {
  userId: string;
  email: string;
}

const UMA_HORA_EM_MS = 60 * 60 * 1000;

// btoa/atob existem no edge e no Node >= 16; Buffer é o fallback de runtime antigo
function paraBase64(data: string): string {
  return typeof btoa === 'function'
    ? btoa(data)
    : Buffer.from(data).toString('base64');
}

function deBase64(token: string): string {
  return typeof atob === 'function'
    ? atob(token)
    : Buffer.from(token, 'base64').toString();
}

export function generateToken(userId: string | number, email: string): string {
  return paraBase64(`${userId}-${email}-${Date.now()}`);
}

export function verifyToken(token: string): SessaoToken | null {
  try {
    const partes = deBase64(token).split('-');
    // timestamp é o último segmento; email pode conter '-', então o meio
    // inteiro é o email — partir de split('-') simples truncaria
    const timestamp = parseInt(partes.pop() ?? '', 10);
    const userId = partes.shift();

    if (!userId || Number.isNaN(timestamp)) {
      return null;
    }

    if (Date.now() - timestamp > UMA_HORA_EM_MS) {
      return null;
    }

    return { userId, email: partes.join('-') };
  } catch {
    return null;
  }
}
