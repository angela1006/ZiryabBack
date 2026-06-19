import {
  decryptCredential,
  decryptStoredPassword,
  encryptCredential,
} from '../utils/credential-crypto.js';

describe('credential-crypto', () => {
  it('round-trip cifrar y descifrar', () => {
    const plaintext = 'Estudiante123456';
    const stored = encryptCredential(plaintext);

    expect(stored.startsWith('v1:')).toBe(true);
    expect(decryptCredential(stored)).toBe(plaintext);
  });

  it('decryptStoredPassword devuelve legacy en claro', () => {
    expect(decryptStoredPassword('password-en-texto-plano')).toBe(
      'password-en-texto-plano',
    );
  });

  it('decryptStoredPassword descifra v1:', () => {
    const stored = encryptCredential('clave-demo');
    expect(decryptStoredPassword(stored)).toBe('clave-demo');
  });

  it('falla con blob v1: corrupto', () => {
    expect(() => decryptCredential('v1:AAAA')).toThrow();
  });
});
