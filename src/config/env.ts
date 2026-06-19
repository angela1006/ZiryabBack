import { z } from 'zod';
import dotenv from 'dotenv';

// ✅ IMPORTANTE: Cargar las variables de entorno ANTES de parsear
dotenv.config();

/**
 * Red con proxy SSL (universidad, WiFi público): Firebase Admin no puede verificar
 * el certificado al llamar a Google (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
 * Solo en desarrollo explícito; en .env local: SKIP_TLS_VERIFY=true
 */
if (process.env.NODE_ENV === 'development' && process.env.SKIP_TLS_VERIFY === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn(
    '⚠️  SKIP_TLS_VERIFY=true — verificación TLS desactivada (solo desarrollo local)',
  );
}

function normalizeCredentialsEncryptionKey(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^["']|["']$/g, '');
}

// Define el esquema con Zod
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRY: z.string().default(
  process.env.NODE_ENV === 'production' ? '24h' : '7d'
),
  
  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Firebase
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  /** Web API key (Identity Toolkit). En test Jest se usa un placeholder si falta en .env */
  FIREBASE_WEB_API_KEY: z.preprocess(
    (v) => {
      if (typeof v === 'string' && v.length > 0) return v;
      return process.env.NODE_ENV === 'test' ? 'jest-web-api-key-placeholder' : '';
    },
    z
      .string()
      .min(1, 'FIREBASE_WEB_API_KEY: añádela al .env (Firebase Console → Project settings → Web API Key)'),
  ),

  FRONTEND_URL: z.string(),

  /** URL pública del API (sin barra final). Usada en Swagger; por defecto Render en producción. */
  API_PUBLIC_URL: z
    .string()
    .url('API_PUBLIC_URL debe ser una URL válida')
    .optional(),

  CLOUDINARY_CLOUD_NAME: z.preprocess(
    (v) => {
      if (typeof v === 'string' && v.length > 0) return v;
      return process.env.NODE_ENV === 'test' ? 'test-cloud' : '';
    },
    z.string().min(1, 'CLOUDINARY_CLOUD_NAME es obligatoria'),
  ),
  CLOUDINARY_API_KEY: z.preprocess(
    (v) => {
      if (typeof v === 'string' && v.length > 0) return v;
      return process.env.NODE_ENV === 'test' ? 'test-key' : '';
    },
    z.string().min(1, 'CLOUDINARY_API_KEY es obligatoria'),
  ),
  CLOUDINARY_API_SECRET: z.preprocess(
    (v) => {
      if (typeof v === 'string' && v.length > 0) return v;
      return process.env.NODE_ENV === 'test' ? 'test-secret' : '';
    },
    z.string().min(1, 'CLOUDINARY_API_SECRET es obligatoria'),
  ),

  /** Clave AES-256 (32 bytes en hex, 64 caracteres). Obligatoria en producción (Render). */
  CREDENTIALS_ENCRYPTION_KEY: z.preprocess(
    (v) => {
      const normalized = normalizeCredentialsEncryptionKey(v);
      if (normalized.length > 0) return normalized;
      return process.env.NODE_ENV === 'test'
        ? '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'
        : '';
    },
    z
      .string()
      .length(64, 'CREDENTIALS_ENCRYPTION_KEY debe tener 64 caracteres hex (32 bytes)')
      .regex(/^[0-9a-fA-F]{64}$/, 'CREDENTIALS_ENCRYPTION_KEY debe ser hexadecimal'),
  ),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const credIssue = parsed.error.issues.find((i) => i.path[0] === 'CREDENTIALS_ENCRYPTION_KEY');
  if (credIssue) {
    console.error(
      '\n❌ Falta CREDENTIALS_ENCRYPTION_KEY en Render (Environment):\n' +
        '   Genera una clave: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n' +
        '   Añádela en el dashboard → ZiryabBack → Environment → CREDENTIALS_ENCRYPTION_KEY\n',
    );
  }
  throw parsed.error;
}

export const env = parsed.data;