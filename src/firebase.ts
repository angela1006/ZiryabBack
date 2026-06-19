import admin from 'firebase-admin';
import { env } from './config/env.js';

// Inicializar Firebase Admin una sola vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Importante: reemplazar \n
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export const firebaseAdmin = admin;
export const firebaseAuth = admin.auth();