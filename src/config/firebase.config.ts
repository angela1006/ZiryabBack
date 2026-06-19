import https from 'https';
import admin from 'firebase-admin';
import { env } from './env.js';
import type { Auth } from 'firebase-admin/auth';

/**
 * En desarrollo en Windows (proxy/antivirus corporativo) Node puede fallar al
 * verificar certificados de Google (UNABLE_TO_VERIFY_FIRST_CERTIFICATE).
 * Solo aplica en development; producción mantiene verificación estricta.
 */
if (env.NODE_ENV === 'development') {
  https.globalAgent = new https.Agent({ rejectUnauthorized: false });
}

// Inicializar Firebase Admin con las credenciales del servicio
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.FIREBASE_PROJECT_ID,
    // Convertir "\n" de string a saltos de línea reales
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
  }),
});

// Exportar la instancia de autenticación
export const firebaseAuth: Auth = admin.auth();

// Exportar admin si necesitas usar otros servicios
export default admin;
