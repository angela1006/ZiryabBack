import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const VERSION_PREFIX = 'v1:';

const getKey = (): Buffer => Buffer.from(env.CREDENTIALS_ENCRYPTION_KEY, 'hex');

export const encryptCredential = (plaintext: string): string => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const blob = Buffer.concat([iv, authTag, ciphertext]);
  return `${VERSION_PREFIX}${blob.toString('base64url')}`;
};

export const decryptCredential = (stored: string): string => {
  if (!stored.startsWith(VERSION_PREFIX)) {
    throw new Error('Formato de credencial cifrada no soportado');
  }

  const payload = Buffer.from(stored.slice(VERSION_PREFIX.length), 'base64url');
  if (payload.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error('Blob de credencial corrupto');
  }

  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
};

/** Compatibilidad con filas legacy en texto plano (sin prefijo v1:). */
export const decryptStoredPassword = (stored: string): string => {
  if (!stored.startsWith(VERSION_PREFIX)) {
    return stored;
  }
  return decryptCredential(stored);
};
