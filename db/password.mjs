// Hash de senha com scrypt (node:crypto, sem dependência). Fonte única: o seed (Node puro) e o app
// (Next) importam este mesmo arquivo, para o formato nunca divergir.
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

const PREFIX = 'scrypt';
const COST = 16384; // N: ~16 MB e ~50 ms; abaixo do maxmem padrão do Node (32 MB)
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 32;

/** @param {string} plain @returns {Promise<string>} `scrypt$N$r$p$salt$hash` (salt e hash em base64) */
export async function hashPassword(plain) {
  const salt = randomBytes(16);
  const key = await scrypt(plain, salt, KEY_LENGTH, { N: COST, r: BLOCK_SIZE, p: PARALLELISM });
  return [PREFIX, COST, BLOCK_SIZE, PARALLELISM, salt.toString('base64'), key.toString('base64')].join('$');
}

/** @param {unknown} value */
export function isPasswordHash(value) {
  return typeof value === 'string' && value.startsWith(`${PREFIX}$`);
}

/**
 * Compara em tempo constante. Valor que não é hash (senha em texto puro de banco antigo) NUNCA confere:
 * quem tem banco antigo recria o banco local (`yarn dev:db:reset`) em vez de o app aceitar texto puro.
 * @param {string} plain @param {unknown} stored @returns {Promise<boolean>}
 */
export async function verifyPassword(plain, stored) {
  if (!isPasswordHash(stored)) return false;
  const [, n, r, p, saltB64, hashB64] = String(stored).split('$');
  if (!saltB64 || !hashB64) return false;
  try {
    const expected = Buffer.from(hashB64, 'base64');
    const actual = await scrypt(plain, Buffer.from(saltB64, 'base64'), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
