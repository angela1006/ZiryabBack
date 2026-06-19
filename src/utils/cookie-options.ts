import { env } from '../config/env.js';

const isProduction = env.NODE_ENV === 'production';

/** Opciones de cookie de sesión (httpOnly). En producción: SameSite=None para front/API en distinto origen. */
export const cookieAuthOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict',
  maxAge: 24 * 60 * 60 * 1000,
};
